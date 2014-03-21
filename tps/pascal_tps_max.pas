program tps_max;
uses sysutils;

{

	Run:
	fpc pascal_tps_max.pas
	./pascal_tps_max

}



var t: Double;
var s,n: String;

begin

t := 0;
s := TimeToStr(Time);

while true do
begin

	n := TimeToStr(Time);

	if s <> n then
	begin
		s := n;
		writeln('Pascal: Tick Per Second: ', t:10:0);
		t := 0;
	end;
	t += 1;
end;



end.
