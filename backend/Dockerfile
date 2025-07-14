FROM surnet/alpine-wkhtmltopdf:3.20.2-0.12.6-full as wkhtmltopdf
FROM python:3.13-alpine

WORKDIR /app

# dependencies for wkhtmltopdf
RUN apk add --no-cache \
    libstdc++ \
    libx11 \
    libxrender \
    libxext \
    libssl3 \
    ca-certificates \
    fontconfig \
    freetype \
    ttf-dejavu \
    ttf-droid \
    ttf-freefont \
    ttf-liberation \
  && apk add --no-cache --virtual .build-deps \
    msttcorefonts-installer \
  && update-ms-fonts \
  && fc-cache -f \
  && rm -rf /tmp/* \
  && apk del .build-deps

COPY --from=wkhtmltopdf /bin/wkhtmltopdf /bin/wkhtmltopdf
COPY --from=wkhtmltopdf /bin/wkhtmltoimage /bin/wkhtmltoimage
COPY --from=wkhtmltopdf /lib/libwkhtmltox* /lib/

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY notify.py ./src/notify.py
ENV PYTHONPATH=/app/src

WORKDIR /app/src

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

