c = npm -h
f:
	docker-compose run  --rm itsfront $(c)


b:
	docker-compose run  --rm itsback $(c)

up:
	docker-compose up -d
down:
	docker-compose down

init: down up
