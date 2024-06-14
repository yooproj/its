c = npm -h
f:
	docker-compose run -p "3333:3000" --rm itsfront $(c)


b:
	docker-compose run -p "3000:3000" --rm itsback $(c)
