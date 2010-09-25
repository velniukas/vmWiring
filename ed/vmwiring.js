// create a vm node with connection points
public function drawVM(name, x, y, w, h, intext, outtext) {
	var vm = paper.set();

	// rounded edge & connection nodes
	var re=10; nw=30; nh=10;
	var nn = paper.rect(x,y,w,h,re);
	nn.attr("fill", "#fff");
	nn.attr("stroke", "#030");
	var nametext = paper.text(x+w/2, y+h-re-10, name);
	vm.push(nn, nametext);
	
	// input points
	var maxlen = 0;
	for(i=0;i<intext.length;i++) {
		var offset = y+h-re-(nh*(i+1)+1);
		var t = paper.text(x-nw+nw/2, offset+3, intext[i]);
		var len = t.getBBox().width;
		if( len > maxlen ) { maxlen = len; }
		vm.push(t);
	}
	for(i=0;i<intext.length;i++) {
		var offset = y+h-re-(nh*(i+1)+1);
		var n = paper.rect(x-maxlen,offset,maxlen,nh);
		n.attr("fill", "#ccc");
		n.attr("stroke", "#00f");
		n.toBack();
		vm.push(n);
	}		
	
	// output points
	for(i=0;i<outtext.length;i++) {
		var offset = y+h-re-(nh*(i+1)+1);
		var n = paper.rect(x+w,offset,nw,nh);
		n.attr("fill", "#aaa");
		n.attr("stroke", "#00f");
		var t = paper.text(x+w+nw/2, offset+3, outtext[i]);
		vm.push(n,t);
	}


	var start = function () {
		// storing original coordinates
		this.ox = this.attr("cx");
		this.oy = this.attr("cy");
		this.attr({opacity: 1});
		this.attr({stroke: "#f00"});
	},
	move = function (dx, dy) {
		// move will be called with dx and dy
		this.attr({cx: this.ox + dx, cy: this.oy + dy});
	},
	up = function () {
		// restoring state
		this.attr({opacity: .5});
		this.attr({stroke: "#000"});
	};

	vm.drag(move, start, up);
	return vm;
}
</script>