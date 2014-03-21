#!/usr/bin/python

import time

t = 0
s = time.strftime("%s")

while 1:
	n = time.strftime("%s")
	if s != n :
		s = n
		print "Python: Tick Per Second:", t
		t = 0
	t+=1
