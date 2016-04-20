FROM golang:alpine
ENV FLAVOR production
ADD bin/gradientzoo /
CMD ["/gradientzoo"]