FROM python:3.8-buster
WORKDIR /usr/src/app
COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY ./server.py ./server.py
COPY ./static ./static
COPY ./templates ./templates
EXPOSE 5555
CMD ["python", "./server.py"]