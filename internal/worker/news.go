package worker

import (
	"log"
	"time"
)

func StartNewsFetcher() {
	go func() {
		for {
			log.Println("Fetching news...")
			// Simulate work
			time.Sleep(1 * time.Minute)
		}
	}()
}
