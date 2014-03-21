package main

/*

	Run:
	go build go_tps_max.go
	./go_tps_max

*/

import "fmt"
import "time"

func main() {
    curr := time.Now()
    tick := 0
    for {
	now := time.Now()
	if now.Sub(curr) > time.Second {
	    curr = now
	    fmt.Printf("Ticks per second: %v \n", tick);
	    tick = 0;
	}
	tick++
    }
}
