/**
 * SPACE HEALTH MONITO — Space Habitat MQTT v5 Pub/Sub Client Service
 *
 * Simulates real-world asynchronous IoT sensor pub/sub streams used inside
 * ISS / Lunar Gateway / Artemis habitats (wearables publishing to crew topics,
 * environmental nodes publishing to habitat ECLSS/CPDS topics, dashboard subscribing
 * with standard MQTT + and # wildcard topic matching).
 */

export type MqttQos = 0 | 1 | 2;

export type MqttConnectionState = 'CONNECTED' | 'RECONNECTING' | 'DTN_BUFFERING';

export interface MqttMessage<T = Record<string, unknown>> {
  packetId: string;
  topic: string;
  qos: MqttQos;
  retain: boolean;
  timestamp: string;
  bytes: number;
  payload: T;
}

export interface MqttBrokerStats {
  brokerUrl: string;
  clientId: string;
  state: MqttConnectionState;
  messagesPublished: number;
  messagesDelivered: number;
  bytesTransferred: number;
  activeSubscriptions: number;
  retainedTopicsCount: number;
  lastPublishAt: string | null;
}

export type MqttTopicCallback<T = Record<string, unknown>> = (message: MqttMessage<T>) => void;

interface SubscriptionEntry {
  id: string;
  filter: string;
  callback: MqttTopicCallback<any>;
}

/**
 * Standard MQTT v5 topic wildcard matcher supporting single-level (+) and multi-level (#) wildcards.
 */
export function mqttTopicMatches(filter: string, topic: string): boolean {
  if (filter === '#' || filter === topic) return true;

  const filterParts = filter.split('/');
  const topicParts = topic.split('/');

  for (let i = 0; i < filterParts.length; i++) {
    const fPart = filterParts[i];
    if (fPart === '#') {
      return i === filterParts.length - 1;
    }
    if (i >= topicParts.length) {
      return false;
    }
    if (fPart !== '+' && fPart !== topicParts[i]) {
      return false;
    }
  }

  return filterParts.length === topicParts.length;
}

class MqttClientService {
  private brokerUrl = 'mqtts://gateway-edge.nasa.local:8883';
  private clientId = `shm-console-${Math.random().toString(36).slice(2, 8)}`;
  private state: MqttConnectionState = 'CONNECTED';
  private subscriptions: SubscriptionEntry[] = [];
  private retainedMessages: Map<string, MqttMessage<any>> = new Map();
  private recentPackets: MqttMessage<any>[] = [];
  private packetCounter = 0;
  private messagesPublished = 0;
  private messagesDelivered = 0;
  private bytesTransferred = 0;
  private lastPublishAt: string | null = null;
  private stateListeners: Set<(stats: MqttBrokerStats) => void> = new Set();

  public connect(): MqttConnectionState {
    this.state = 'CONNECTED';
    this.notifyState();
    return this.state;
  }

  public setConnectionState(nextState: MqttConnectionState) {
    this.state = nextState;
    this.notifyState();
  }

  public getConnectionState(): MqttConnectionState {
    return this.state;
  }

  public subscribe<T = Record<string, unknown>>(
    topicFilter: string,
    callback: MqttTopicCallback<T>
  ): () => void {
    const id = `sub_${++this.packetCounter}_${Math.random().toString(36).slice(2, 6)}`;
    const entry: SubscriptionEntry = { id, filter: topicFilter, callback };
    this.subscriptions.push(entry);

    // Immediately deliver retained packets matching this topic filter (MQTT spec)
    this.retainedMessages.forEach((msg, topic) => {
      if (mqttTopicMatches(topicFilter, topic)) {
        this.messagesDelivered++;
        callback(msg);
      }
    });

    this.notifyState();

    return () => {
      this.subscriptions = this.subscriptions.filter((s) => s.id !== id);
      this.notifyState();
    };
  }

  public publish<T extends Record<string, unknown>>(
    topic: string,
    payload: T,
    options?: { qos?: MqttQos; retain?: boolean }
  ): MqttMessage<T> {
    const serialized = JSON.stringify(payload);
    const bytes = serialized.length + topic.length + 4;
    const timestamp = new Date().toISOString();

    const message: MqttMessage<T> = {
      packetId: `mqtt-${(++this.packetCounter).toString(36)}`,
      topic,
      qos: options?.qos ?? 1,
      retain: options?.retain ?? true,
      timestamp,
      bytes,
      payload,
    };

    this.messagesPublished++;
    this.bytesTransferred += bytes;
    this.lastPublishAt = timestamp;

    if (message.retain) {
      this.retainedMessages.set(topic, message);
    }

    this.recentPackets = [message, ...this.recentPackets].slice(0, 60);

    this.subscriptions.forEach((sub) => {
      if (mqttTopicMatches(sub.filter, topic)) {
        this.messagesDelivered++;
        try {
          sub.callback(message);
        } catch {
          // Isolate subscriber errors from broker dispatch loop
        }
      }
    });

    this.notifyState();
    return message;
  }

  public getRecentPackets(topicFilter?: string, limit: number = 12): MqttMessage<any>[] {
    const filtered = topicFilter
      ? this.recentPackets.filter((m) => mqttTopicMatches(topicFilter, m.topic))
      : this.recentPackets;
    return filtered.slice(0, limit);
  }

  public getStats(): MqttBrokerStats {
    return {
      brokerUrl: this.brokerUrl,
      clientId: this.clientId,
      state: this.state,
      messagesPublished: this.messagesPublished,
      messagesDelivered: this.messagesDelivered,
      bytesTransferred: this.bytesTransferred,
      activeSubscriptions: this.subscriptions.length,
      retainedTopicsCount: this.retainedMessages.size,
      lastPublishAt: this.lastPublishAt,
    };
  }

  public subscribeStats(listener: (stats: MqttBrokerStats) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.getStats());
    return () => this.stateListeners.delete(listener);
  }

  private notifyState() {
    const stats = this.getStats();
    this.stateListeners.forEach((fn) => fn(stats));
  }
}

export const mqttClientService = new MqttClientService();
