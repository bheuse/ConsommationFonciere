FROM python:3.9.10
LABEL maintainer="Bernard Heuse <bheuse@gmail.com>"

ADD ./requirements.txt                   /
RUN pip install -r requirements.txt

ADD ./*.py                               /
ADD ./*.js                               /
ADD ./*.html                             /
ADD ./*.rnd                              /
ADD ./*.bat                              /
ADD ./*.sh                               /
ADD ./*.xls*                             /
ADD ./data/*                             /data/
ADD ./doc/*                              /doc/
ADD ./input/*                            /input/
ADD ./output/*                           /output/

CMD [ "RunVigiFoncierPaca.sh"]

CMD [ "python", "./ConsommationFonciereV4.py --clean" ]




