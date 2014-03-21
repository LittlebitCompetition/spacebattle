#!/usr/bin/php
<?

$t = 0;
$s = time();

while ( true ) {

	$n = time();

	if ( $s != $n) {
		$s = $n;
		echo "PHP: Tick Per Second: $t\n";
		$t = 0;
	}

	$t++;
}





?>
