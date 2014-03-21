#!/usr/bin/perl

use POSIX qw(strftime);

my $tick = 0;
my $time = strftime "%s", localtime;
my $now = 0;

while (1) {
	$now = strftime "%s", localtime;

	if ( $time != $now ) {
		$time = $now;
		print "Perl: Tick Per Second: $tick\n";
		$tick = 0;
	}
	$tick++;
}

