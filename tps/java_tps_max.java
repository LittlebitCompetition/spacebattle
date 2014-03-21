import java.util.*;

/* 

		Run:
		javac java_tps_max.java
		java java_tps_max

*/

public class java_tps_max {
	public static void main (String[] args) {

		int t = 0;
		long s = System.currentTimeMillis() / 1000L;
		long n = 0;
		while (true) {

			n = System.currentTimeMillis() / 1000L;

			if ( s != n ) {
				s = n;
				System.out.println ("Java: Tick Per Second: "+t);
				t=0;
			}
			t++;

		}
    }
}
