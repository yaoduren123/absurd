describe("Fixing bug in array usage", function() {

	var api = require('../../index.js')();

	it("should use array", function(done) {
		api.plugin("hoverEffect", function(api, color) {
		    return {
		        "&:hover": {
		            color: color,
		            background: api.lighten(color, 60),
		            ".ie8 &": {
		            	color: "blue"
		            }
		        }
		    };
		});
		api.add({
		    a: {
		        color: "#000",
		        hoverEffect: "#999"
		    }
		});
		api.compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("a {\n\
  color: #000;\n\
}\n\
a:hover {\n\
  color: #999;\n\
  background: #f5f5f5;\n\
}\n\
.ie8 a:hover {\n\
  color: blue;\n\
}\n");
			done();
		});		
	});

});