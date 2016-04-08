FROM golang:alpine
ADD bin/gradientzoo /
CMD ["/gradientzoo"]