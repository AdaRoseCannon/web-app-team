module.exports.randomFrom = function(array) {
	return array[(Math.floor(Math.random() * array.length))];
};