-module(simplify).
-export([simplify/2,simplify/3,simplify/1]).
-record(point,{x, y}).
getSquareDistance(P1,P2)->
	lists:foldl(fun(X, Sum) -> 
		X*X + Sum end, 0, lists:zipwith(fun(A,B)->
			A-B end,P1,P2)).
calcStuff(P,P1,P2,D)->
	Top = lists:foldl(fun(X, Sum) -> X + Sum end, 0, lists:zipwith3(fun(A,B,C)->(A-B)*C end,P,P1,D));
	Bottom = lists:foldl(fun(X, Sum) -> X*X + Sum end, 0, D);
	T = Top/Bottom;
	if
		T>1->p2;
		T>0->lists:zipwith(fun(A,B)->A+(B*T) end,P1,D)
		true->p1
	end.
getSquareSegmentDistance(P, P1,P2)->
	D = lists:zipwith(fun(A,B)->
		A-B end,P2,P1);
	Pred = all(fun(A)->A=/=0 end,D).
	if
		Pred -> D2 = calcStuff(P,P1,P2,D);
		True -> D2 = P1
	end;
	lists:foldl(fun(X, Sum) -> X*X + Sum end, 0,lists:zipwith(fun(A,B)->A-B end,P,D2)).
simplifyRadialDistance(S,OldList)->
	[P|O]=OldList;
	simplifyRadialDistance(S,O,[P]),
simplifyRadialDistance(_,[],NewList)->
	NewList,
simplifyRadialDistance(S,OldList,NewList)->
	[Point|Rest]=OldList;
	[PrevPoint|_]=NewList;
	if
		getSquareDistance(Point, PrevPoint) > S=>simplifyRadialDistance(S,Rest,[Point|NewList]);
		true=>simplifyRadialDistance(S,Rest,NewList)
	end.
maxSqDist(Points)->
	[First|_]=Points;
	Last = lists:last(Points);
	lists:max(lists:map(fun(P)->
		getSquareSegmentDistance(P,First,Last) end,Points)),
maxSqDist(Points,First,Last)->
	maxSqDist(lists:sublist(Points,Start,Last-Start+1)).
simplify(Points)->
	simplifyDouglasPeucker(Points, 1),
simplify(Points, Tolerance)->
	SqTolerance = Tolerance * Tolerance;
	simplifyDouglasPeucker(Points, SqTolerance),
simplify(Points, Tolerance, highestTolerence)->
	SqTolerance = Tolerance * Tolerance;
	P2 = simplifyRadialDistance(Points, SqTolerance);
	simplifyDouglasPeucker(P2, SqTolerance).
