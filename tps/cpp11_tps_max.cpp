#include <iostream>
#include <chrono>

/* 

	Run:
	g++ -std=c++11 ./cpp11_tps_max.cpp -o cpp11_tps_max
	./cpp11_tps_max

*/

int main(int argc,char ** argv) {
	auto tick = 0;
	auto time = std::chrono::high_resolution_clock::now();

	while(true) {
		auto now = std::chrono::high_resolution_clock::now();

		std::chrono::duration<double> time_span = std::chrono::duration_cast<std::chrono::duration<double>>(now - time);	

		if (time_span.count() > 1.0f) {
			time = now;
			std::cout << "Tick per second: " << tick << std::endl;
			tick = 0;
		}
		tick++;
	}
}
