FROM python:3.11-slim
WORKDIR /app
COPY server_ml.py ./
EXPOSE 5050
CMD ["python", "server_ml.py"]
