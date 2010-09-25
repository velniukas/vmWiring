// global vmWiring variables
var connections = [];
var drag_obj = null;

var dragger = function () {
    this.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
    this.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");
    this.animate({"fill-opacity": .2}, 500);
	drag_obj = this;
	},
    move = function (dx, dy) {
		drag_obj = this;
        var att = this.type == "rect" ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.ox + dx, cy: this.oy + dy};
        this.attr(att);
        for (var i = connections.length; i--;) {
            paper.connection2BBox(connections[i]);
        }
        paper.safari();
  	},
    up = function () {
        this.animate({"fill-opacity": 0}, 500);		
    },
	up_and_glue = function() {
		this.animate({"fill-opacity": 0}, 500);		
	},
	
	// Figure out what object (other than drag_obj) is under the pointer
	over = function (event) {
		console.log("drag: "+this.name+" -> "+event.name);
		if( event.name == "in.webserver" ) { 
			console.log("yep, its a in.")
			var f = connections[0].from;
			var l = connections[0].line;
			
			connections.pop();
			
			console.log("conn: "+f.name+" -> "+event.name)
			connections.push(f, event, l, "#ccc");
			
			drag_obj.hide();
			drag_obj.remove();
		}
   };
	
// create a vm node with connection points
function drawVM(name, x, y, w, h, intext, outtext) {
	var vm = paper.set().draggable.enable();
	var ghost_paper = Raphael(0,0,100,100);
	

	// rounded edge & connection nodes
	var re=10; nw=30; nh=10;
	var nn = paper.rect(x,y,w,h,re);
	nn.attr("fill", "#fff");
	nn.attr("stroke", "#000");
	var nametext = paper.text(x+w/2, y+h-re-10, name);
	vm.push(nn, nametext);
	
	// input points
	
	// measure max text extent
	var maxlen = getMaxHTextExtent(ghost_paper, intext);
	
	for(i=0;i<intext.length;i++) {
		var offset = y+h-re-(nh*(i+1)+1);
		nw = maxlen;
		var n = drawConnectionBox("in", x, offset, nw, nh, intext[i]);	
		
		vm.push(n);
	}		
	
	// output points
	maxlen = getMaxHTextExtent(ghost_paper, outtext);
	for(i=0;i<outtext.length;i++) {
		var offset = y+h-re-(nh*(i+1)+1);
		nw = maxlen;
		var n = drawConnectionBox("out", x+w, offset, nw, nh, outtext[i]);
		
		vm.push(n);
	}
	ghost_paper.remove();
	ghost_paper = null;

	return vm;
}

function drawConnectionBox(pos, x, y, bw, bh, text) {
	var nbox = paper.set();
	var xoffset = 0; 
	var spacer = 20;
	var n = null; t = null; rh = null;
	
	if( pos == "in" ) { 
		n = paper.rect(x-bw-spacer,y,bw+spacer,bh);
		t = paper.text(x-bw+bw/2-spacer/2, y+3, text);
		rh = createAnchor(x-bw-spacer+5, y+bh/2, -spacer, "in."+text);
	} else if( pos == "out") {
		n = paper.rect(x,y,bw+spacer,bh);
		t = paper.text(x+bw/2+spacer/2, y+3, text);		
		rh = createAnchor(x+bw+spacer-5, y+bh/2, spacer, "out."+text);	
	} else {
		console.log("invalid connection box position: ("+text+") - "+pos);
	}
	n.attr("fill", "#ccc");
	n.attr("stroke", "#00f");	

	nbox.push(n, t, rh);			

	return nbox;
}

function getMaxHTextExtent(gpaper, textarray) {
	var maxlen = 0;
	for(i=0;i<textarray.length;i++) {
		var tmp = gpaper.text(100, 50, textarray[i]);
		var len = tmp.getBBox().width;
		if( len > maxlen ) { 
			maxlen = len;
			//console.log(textarray[i] + " " + maxlen);
		}
		tmp.remove();
		tmp = null;
	}
	return maxlen;
}

// When you drag from this handle, a rubber band line appears:
function createAnchor(xx, yy, offset, nme) {
	var anchor = paper
	  .circle(xx, yy, 2)
	  .attr({"stroke-width": 1, fill: "#F00"});
	anchor.name = nme;
	anchor.node.name = nme;
	
	// on clicking on the circle, 
	// 1. create a new draggable object
	// 2. create a connection object between the rh and the draggable object
	// 3. if the draggable object dropped on a rh, then connect the two rh's 
	$(anchor.node).bind('click', function(e) { 
		console.log("anchor clicked: "+this.name)
		var drag_anchor = paper
			.circle(xx+offset, yy, 5)
			.attr({"stroke-width": 1, fill: "#050", opacity: 0.8})
			.draggable.enable();
		connections.push(paper.connection2BBox(anchor, drag_anchor, "#f57", "#55f"));		
		drag_anchor.drag(move, dragger, up_and_glue);
		
		// needed for the dropped_on event
		drag_anchor.dragFinish = over;	
		drag_anchor.make_draggable();
		
	});
	
	return anchor;
}
