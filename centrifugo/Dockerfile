FROM centrifugo/centrifugo:v5

COPY config.json /centrifugo/config.json

RUN apk --no-cache add curl

CMD ["centrifugo", "-c", "config.json"]
