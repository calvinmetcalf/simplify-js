pointsFromFile(Path)->
	{_,Bin} = file:read_file(path);
	binary_to_list(Bin).
