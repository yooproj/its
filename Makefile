c = npm -h
n:
	docker-compose run -p "3333:3000" --rm ifn $(c)
