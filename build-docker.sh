sudo docker build -t senswap-app .
sudo docker tag senswap-app:latest tuphanson/senswap-app:latest
sudo docker push tuphanson/senswap-app:latest