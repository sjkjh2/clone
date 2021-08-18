$(document).ready(function(){
	guideHandler();
});

var guideHandler = function(){
	asideMenu();
	
	console.log('guideHandler');
}

var asideMenu = function(){
	$(document).off('click', '.g-dep01 > li').on('click', '.g-snb li', function(){
		var $this = $(this);
		console.log($this);
		if($this.hasClass('active')){
			console.log('aaa');
			$this.removeClass('active');
		}else{
			$this.addClass('active');
		}
	});
}