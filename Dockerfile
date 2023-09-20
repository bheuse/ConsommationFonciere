# sudo docker build -t conso:v4 .
# sudo docker run --memory=16G  conso:v4

FROM python:3.9.16
LABEL maintainer="Bernard Heuse <bheuse@gmail.com>"

ADD ./requirements.txt                   /
RUN pip install -r requirements.txt

ADD ./*.py                               /
ADD ./*.js                               /
ADD ./*.html                             /
ADD ./*.md                               /
ADD ./*.bat                              /
ADD ./*.sh                               /
ADD ./data/*                             /data/
ADD ./doc/*                              /doc/
ADD ./input/*                            /input/
RUN mkdir ./output

CMD [ "./RunVigiFoncierPaca.sh"]

# CMD [ "python", "./ConsommationFonciereV4.py --clean" ]

#  sudo apt update
#  sudo apt upgrade
#  sudo apt autoremove
#  sudo apt install software-properties-common
#  sudo add-apt-repository ppa:deadsnakes/ppa
#  sudo apt install python3.9 python3.9-venv
#  python3.9 --version
#  python3.9  -m venv venv
#  source venv/bin/activate
#  pip install -r requirements.txt
