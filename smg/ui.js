$(document).ready(function(){
  initHandler();
});

function initHandler(){
  console.log('initHandler');
  toolTipHandler();
}

var toolTipHandler = function(){
  // 툴팁 버튼 이전에 label이 있으면 클릭하도록 변경
  for(var a = 0; a < $('.tool-header .btn-tool').length; a++){
    var list = $('.tool-header .btn-tool').eq(a),
        listPrvText = list.prev('label.ui-label').length ? list.prev('.label.ui-label') : null;
        if(listPrvText != null){
          var gapH = list.innerHeight();
          listPrvText.attr('role', 'button').removeAttr('for').attr('aria-expanded', 'false').css({'height':gapH + 'px', 'display':'inlineFlex', 'alignItems':'center'});
        }
  }
  
  $(document).off('click', '.tool-header .btn-tool').on('click', '.tool-header .btn-tool', function(){
    var $this = $(this);
    if($this.attr('aria-expanded') == 'false'){
      if($this.prev('label.ui-label').length){
        $this.prev('label.ui-label').attr('aria-expanded', 'ture');
      }
      $this.attr('aria-expanded', 'true');
      $this.parent().next('.tool-body').attr('aria-hidden', 'false');
      // 툴팁 박스가 컨텐츠 하단에 뜰때 위로 뜨도록 변경
      var toolBody = $this.parent().next('.tool-body'),
          chkHeight = toolBody.offset().top + toolBody.innerHeight(),
          bodyHeight = toolBody.innerHeight(),
          conWrapCalcHeight = $('.contents').innerHeight() - parseInt($('.contents').css('padding-bottom'));
          
      if(chkHeight > conWrapCalcHeight){
        var contentPdBtm = parseInt($('.contents').css('padding-bottom')),
            resultGap = bodyHeight + contentPdBtm;
        $('.contents').attr('data-pdbtm', contentPdBtm);
        $('.contents').css('padding-bottom', resultGap);
        $('.contents').attr('data-tooltip-pdbtm', resultGap);
      }
    }else{
      if($this.prev('label.ui-label').length){
        $this.prev('label.ui-label').attr('aria-expanded', 'true');
      }
      $this.attr('aria-expanded', 'false');
      $this.parent().next('.tool-body').attr('aria-hidden', 'true');
      if($('.contents').attr('data-pdbtm') != undefined){
        var val = $('.contents').attr('data-pdbtm');
        $('.contents').css('padding-bottom', val + 'px');
      }
      if($('.contents').attr('data-tooltip-pdbtm') != undefined){
        $('.contents').removeAttr('data-tooltip-pdbtm');
      }
    }
  });
  
  $(document).off('click', '.tool-body .btn-close').on('click', '.tool-body .btn-close', function(){
    var $this = $(this);
    $this.parent().prev('.tool-header').find('.btn-tool').attr('aria-expanded', 'false');
    $this.closest('.tool-body').attr('aria-hidden', 'true');
    $this.parent().prev('.tool-header').find('.btn-tool').focus();
    if($('.contents').attr('data-pdbtm') != undefined){
      var val = $('.contents').attr('data-pdbtm');
      $('.contents').css('padding-bottom', val + 'px');
    }
    if($('.contents').attr('data-tooltip-pdbtm') != undefined){
      $('.contents').removeAttr('data-tooltip-pdbtm');
    }
  });
  
  $(document).on('click', '.tool-group label.ui-label', function(){
    var $this = $(this);
    if($this.attr('aria-expanded') == 'true'){
      $this.attr('aria-expanded', 'false');
    }else{
      $this.attr('aria-expanded', 'true');
    }
    $this.next('.btn-tool').tirgger('click');
    $this.focus();
  });
};



// 맞춤메뉴
var fitMenu = {
  DEDAULT : {
    direction : 'y',
    type : 'pc',
    boxGap : 10,
    divideNum : 4,
    easeTime : 0.3
  },
  
  common : {
    transformValue : function(target, type){
      if(target != false || target != null || target != undefined) {
        var obj = target;
        var transformMatrix = obj.css('-webkit-transform') || obj.css('-moz-transform') || obj.css('-ms-transform') || obj.css('-o-transform') || obj.css('transform');
        if(transformMatrix == undefined){
          return;
        }
        var matrix = transformMatrix.replace(/[^0-9\-.,]/g, '').split(',');
        var trfX = parseInt(matrix[12] || matrix[4]);
        var trfY = parseInt(matrix[13] || matrix[5]);
        
        if(type == 'x'){
          return trfX;
        }else if(type == 'y'){
          return trfY;
        }else{
          return trfY;
        }
      }
    }
  },
  
  initialize : function(target, option){
    fitMenu.initPrototypeHandler();
    
    var self = this;
    this.container = target;
    this.opt = $.extend({}, fitMenu.DEDAULT, option);
    
    this.arrOfLiLoc = [];   // .list-item의 y값 배열
    this.arrOfList = [];    // .list-item
    this.mouseStartX = 0;   // 마우스 다운시 mouseX 값
    this.mouseStartY = 0;   // 마우스 다운시 mouseY 값
    this.locStartX = 0;     // 타겟 x 값
    this.locStartY = 0;     // 타겟 y 값
    this.curClientX = 0;    // 클라이언트 x 값
    this.curClientY = 0;    // 클라이언트 y 값
    this.targetWidth = 0;   // 타켓 넓이 값
    this.targetHeight = 0;  // 타겟 높이 값
    this.targetIdx = 0;     // 타겟 data-idx 값
    this.positionIdx = 0;   // mouseup or touchend 시 타겟의 위치 idx 값
    this.minWidth = 0;      // 타겟의 x의 최소값
    this.maxWidth = 0;      // 타겟의 x의 최대값
    this.minHeight = 0;     // 타겟의 y의 최소값
    this.maxHeight = 0;     // 타겟의 y의 최대값
    this.gotoPrvNum = null; // 타겟의 이동 위치 넘버
    this.gotoNum = null;    // 타겟의 이동 위치 넘버
    this.currentTargetIdx = null; // 선택된 넘버
    this.moveTarget = null; // 이동 되는 타겟
    this.touchstart = self.opt.type == 'pc' ? 'mousedown' : 'touchstart'; // pc or mobile 마우스 체크
    this.touchmove = self.opt.type == 'pc' ? 'mousemove' : 'touchmove'; // pc or mobile 마우스 체크
    this.touchend = self.opt.type == 'pc' ? 'mouseup mouseleave' : 'touchend mouseleave touchcancel'; // pc or mobile 마우스 체크
    this.init();
    this.resizeInit();
    this.addedRemoveHandler();
  },
  
  initPrototypeHandler : function(){
    fitMenu.initialize.prototype.resizeInit = function(){
      var _this = this;
      $(window).on('resize', function(){
        _this.init();
      });
    };
    
    fitMenu.initialize.prototype.init = function(){
      var _this = this;
      var totalWidth = $('.contents').innerWidth() - parseInt($('.contents').css('padding-left')) * 2;
      _this.targetWidth = (totalWidth - (_this.opt.divideNum - 1) * _this.opt.boxGap) / _this.opt.divideNum; // 타겟 넓이 값
      _this.targetHeight = (totalWidth - (_this.opt.divideNum -  1) * _this.opt.boxGap) / _this.opt.divideNum; // 타겟 넓이 값
      _this.arrOfLiLoc = [];
      _this.arrOfList = [];
      _this.container.find('.list-item').each(function(i){
        var xNum = i % _this.opt.divideNum,
            divideNum = Math.ceil((i + 1) / _this.opt.divideNum) - 1,
            xLoc = xNum * (_this.targetWidth + _this.opt.boxGap),
            yLoc = divideNum * (_this.targetWidth + _this.opt.boxGap);
        if(i == 0){
          $(this).find('.btn-list-delete').css('display', 'none');
          _this.container.attr('data-first', $(this).find('.btn-setbox').attr('data-connect'));
        }else{
          $(this).find('.btn-list-delete').css('display', 'block');
        }
        TweenMax.set($(this), {
          'x' : xLoc,
          'y' : yLoc,
          'width' : _this.targetWidth,
          'height' : _this.targetHeight
        });
        $(this).attr('data-line', divideNum);
        $(this).attr('data-locx', xLoc); // data-locx 셋팅
        $(this).attr('data-locy', yLoc); // data-locy 셋팅
        $(this).attr('data-idx', i); // data-idx 값 셋팅
        
        _this.arrOfLiLoc.push([xLoc, yLoc]);
        _this.arrOfList.push($(this));
      });
      _this.maxHeight = (Math.ceil((_this.arrOfList.length) / _this.opt.divideNum)) * (_this.targetHeight + _this.opt.boxGap) - _this.opt.boxGap;
      _this.container.css('height', _this.maxHeight);
      _this.deleteBtnHandler();
      _this.moveHandler();
      fitMenu_chkMenuHandler(); // ui_ux : 맞춤 메뉴
    };
    
    fitMenu.initialize.prototype.moveHandler = function(){
      var _this = this;
      _this.container.find('.list-item').find('.btn-setbox').off(_this.touchstart).on(_this.touchstart, function(e){
        _this.moveTarget = $(this).closest('.list-item'); // 타겟
        _this.moveTarget.css('z-index', 11); // 타겟 최상위로 올리김
        
        // pc
        if(e.type == 'mousedown'){
          _this.mouseStartY = e.clientY; // 마우스 눌렀을 때 client 위치 값
          // mobile
        }else{
          $('html body').css('overflow', 'hidden');
          _this.mouseStartX = e.originalEvent.touches[0].pageX // 마우스 눌렀을 때 client 위치 값
          _this.mouseStartY = e.originalEvent.touches[0].pageY // 마우스 눌렀을 때 client 위치 값
        }
        
        _this.locStartX = parseFloat(_this.moveTarget.attr('data-locx')); // data 셋팅
        _this.locStartY = parseFloat(_this.moveTarget.attr('data-locy')); // data 셋팅
        _this.targetIdx = _this.moveTarget.attr('data-idx'); // 타겟 IDX 값
        
        $(document).off(_this.touchmove).on(_this.touchmove, function(e){
          // pc
          if(e.type == 'mousemove'){
            _this.curClientX = e.clientX; // 마우스 이동에 따른 client 위치 값
            _this.curClientY = e.clientY; // 마우스 이동에 따른 client 위치 값
            // mobile
          }else{
            _this.curClientX = e.originalEvent.touches[0].pageX; // 마우스 이동에 따른 client 위치 값
            _this.curClientY = e.originalEvent.touches[0].pageY; // 마우스 이동에 따른 client 위치 값
          }
          
          var resultX = _this.locStartX + _this.curClientX - _this.mouseStartX; // 마우스 이동에 따른 타겟 이동 값
          var resultY = _this.locStartY + _this.curClientY - _this.mouseStartY; // 마우스 이동에 따른 타겟 이동 값
          
          if(resultX <= -5) resultX = -5; // 타겟이 x -5보다 작으면 -5으로 이동 제한
          else if(resultX >= _this.container.innerWidth() - _this.targetWidth + 5) resultX = _this.container.innerWidth() - _this.targetWidth + 5; // 타겟이 x 젠체 크기 보다 5 크면 5로 이동 제한
          if(resultY <= -5) resultY = -5; // 타겟이 -5보다 작으면 -5으로 이동 제한
          else if(resultY >= _this.maxHeight - _this.targetHeight + 5) resultY = _this.maxHeight - _this.targetHeight + 5; // 타겟이 y 전체 크기 보다 5 크면 5로 이동 제한 
          TweenMax.set(_this.moveTarget, {x : resultX, y : resultY}); // y값 움직이기
          _this.moveTarget.attr('data-locx', resultX); //타겟 위치값 data 처리
          _this.moveTarget.attr('data-locy', resultY); //타겟 위치값 data 처리
          _this.currentTargetIdx = parseInt(_this.moveTarget.attr('data-idx'));
          _this.moveTargetHandler(); // 타겟 이동 시키기
          
        }).one(_this.touchend, function(e){
          // pc
          if(e.type == 'mouseup'){
            _this.container.find('.list-item').find('.btn-setbox').off('mousedown');
            $(document).off('mouseup mousemove mouseleave'); // mousemove event remove
            //mobile
          }else if(e.type == 'touchend'){
            setTimeout(function(){
              $('html body').removeAttr('style');
            }, 10);
          }
          $(document).off(_this.touchmove);
          _this.container.find('.list-item').find('btn-setbox').off(_this.touchstart);
          
          if(_this.gotoNum == null && _this.curClientX != 0){
            _this.gotoNum = parseInt(_this.moveTarget.attr('data-idx'));
          }
          if(_this.gotoNum != null) {
            _this.moveTarget.attr('data-idx', _this.gotoNum);
            TweenMax.to(_this.moveTarget, _this.opt.easeTime, {
              x : _this.arrOfLiLoc[_this.gotoNum][0],
              y : _this.arrOfLiLoc[_this.gotoNum][1],
              ease : Power4.easeOut,
              onComplete : function(){
                _this.setListHandler();
                _this.gotoNum = null;
                _this.moveTarget.css('z-index', 10); // z-index 평준화
              }
            });
          }
        });
      });
    };
    
    // append 시키기
    fitMenu.initialize.prototype.setListHandler = function(){
      var _this = this,
          lists = _this.container.find('.list-itme'),
          len = lists.length;
      var target = _this.arrOfList.splice(_this.currentTargetIdx, 1);
      _this.arrOfList.splice(_this.gotoNum, 0, target[0]);
      _this.container.html('');
      for(var a = 0; a < len; a++){
        _this.container.append(_this.arrOfList[a]);
      }
      _this.init();
    };
    
    // 드래그시 .list-item 이동
    fitMenu.initialize.prototype.moveTargetHandler = function(){
      var _this = this;
      isNumX = parseFloat(_this.moveTarget.attr('data-locx')),
      isNumY = parseFloat(_this.moveTarget.attr('data-locy'));
      _this.currentTargetIdx = parseInt(_this.moveTarget.attr('data-idx'));
      
      for(var a = 0; a < _this.container.find('.list-item').length; a++){
        var list = _this.container.find('.list-item').eq(a);
        if(isNumX > _this.arrOfLiLoc[a][0] - _this.targetHeight / 2 && isNumX < _this.arrOfLiLoc[a][0] + _this.targetHeight / 2) {
          if(isNumY > _this.arrOfLiLoc[a][1] - _this.targetHeight / 2 && isNumY < _this.arrOfLiLoc[a][1] + _this.targetHeight / 2) {
            _this.gotoNum = a;
          }
        }
      }
      
      if(_this.gotoNum == null) return false;
      var len = _this.container.find('.list-item').length;
      
      if(_this.gotoNum > _this.currentTargetIdx){
        for(var a = 0; a < len; a++){
          var list = _this.container.find('.list-item').eq(a);
          var movingNum = a;
          if(_this.gotoNum < _this.gotoPrvNum){
            if(a > _this.gotoNum){
              movingNum = a;
              TweenMax.to(list, _this.opt.easeTime, {
                x : _this.arrOfLiLoc[movingNum][0],
                y : _this.arrOfLiLoc[movingNum][1],
                ease : Power4.easeOut
              });
            }
          }else{
            if(a <= _this.gotoNum && a > _this.currentTargetIdx){
              movingNum = a - 1;
              TweenMax.to(list, _this.opt.easeTime, {
                x : _this.arrOfLiLoc[movingNum][0],
                y : _this.arrOfLiLoc[movingNum][1],
                ease : Power4.easeOut
              });
            }else{
              movingNum = a;
              TweenMax.to(list.not(_this.moveTarget), _this.opt.easeTime, {
                x : _this.arrOfLiLoc[movingNum][0],
                y : _this.arrOfLiLoc[movingNum][1],
                ease : Power4.easeOut
              });
            }
          }
        }
        _this.gotoPrvNum = _this.gotoNum;
        
      }else if(_this.gotoNum == _this.currentTargetIdx){
        for(var a = 0; a < len; a++){
          var list = _this.container.find('.list-item').eq(a);
          var movingNum = a;
          if(a != _this.gotoNum){
            TweenMax.to(list, _this.opt.easeTime,{
              x : _this.arrOfLiLoc[movingNum][0],
              y : _this.arrOfLiLoc[movingNum][1],
              ease : Power4.easeOut
            });
          }
        }
      }else{
        for(var a = 0; a < len; a++){
          var list = _this.container.find('.list-item').eq(a);
          var movingNum = a;
          if(a < _this.gotoNum){
            movingNum = a;
            TweenMax.to(list, _this.opt.easeTime,{
              x : _this.arrOfLiLoc[movingNum][0],
              y : _this.arrOfLiLoc[movingNum][1]
            });
          }else if(a >= _this.gotoNum && a < _this.currentTargetIdx){
            movingNum = a + 1;
            TweenMax.to(list, _this.opt.easeTime,{
              x : _this.arrOfLiLoc[movingNum][0],
              y : _this.arrOfLiLoc[movingNum][1]
            });
          }else{
            movingNum = a;
            TweenMax.to(list.not(_this.moveTarget), _this.opt.easeTime,{
              x : _this.arrOfLiLoc[movingNum][0],
              y : _this.arrOfLiLoc[movingNum][1]
            });
          }
        }
        _this.gotoPrvNum = _this.gotoNum;
      }
    };
    
    // DELETE 버튼
    fitMenu.initialize.prototype.deleteBtnHandler = function(){
      var _this = this;
      _this.container.find('.list-item .btn-list-delete').off('click').on('click', function(){
        var deleteStr = $(this).siblings('.btn-setbox').attr('data-connect');
        $(this).closest('.list-item').remove();
        _this.init();
        _this.container.attr('data-changeid',deleteStr);
        _this.container.trigger('delete_change');
      });
    };
    
    // CHECK BOX에서 check = 'true' 일경우 ADDED, check = 'false' 일 경우 remove
    fitMenu.initialize.prototype.addedRemoveHandler = function(){
      var _this = this;
      var listItemEl = [
          '  <li class="list-item">',
          '    <button type="button" class="btn btn-sebox" data-connect="setMenuChkbox"></button>',
          '    <button type="button" class="btn btn-list-delete" aria-label="삭제"></button>',
          '  </li>'
      ];
      _this.container.on('addedlist-change', function(){
        var str = listItemEl.join('\n');
        _this.container.append(str);
        var strID = _this.container.attr('data-changeid');
        var strText = _this.container.attr('data-changetext');
        _this.container.find('.list-item:last-child').find('.btn-setbox').attr('data-connect', strID).text(strText);
        _this.init();
      });
      
      _this.container.on('remove-change', function(){
        var len = _this.container.find('.list-itme').length;
        for(var a = 0; a < len; a++){
          var list = _this.container.find('.list-item').eq(a);
          if(list.find('.btn-setbox').attr('data-connect') == _this.container.attr('data-changeid')){
            list.remove();
          }
        }
        _this.init();
      });
    };
  }
};

$.fn.FitMenuView = function(option){
  return new fitMenu.initialize($(this), option);
};

// 맞춤메뉴 ~ 체크박스
var fitMenu_chkMenuHandler = function(){
  if($('.check-menu-group').length && $('.set-menu-lists').length){
    $('.set-menu-lists').off('delete_change').on('delete_change', function(){
      var targetID = $(this).attr('data-changeid');
      $('.check-menu-group').find('#' + targetID).prop('checked', false);
    });
    if($('.set-menu-lists').attr('data-first') != undefined){
      var firstID = $('.set-menu-lists').attr('dta-first');
      for(var a = 0; a < $('.check-menu-group').find('input[type=checkbox]').length; a++){
        var iptList = $('.check-menu-group').find('input[type=checkbox]').eq(a);
        if(iptList.attr('id') == firstID){
          iptList.attr('disabled', 'true');
        }else{
          iptList.removeAttr('disabled');
        }
      }
    }
    
    $('.check-menu-group').find('input[type=checkbox]').off('click').on('click', function(){
      var checkID = $(this).attr('id'),
          checkText = $(this).siblings('.inp-design').text(),
          totalChkLen = $('.check-menu-group').find('input[type=checkbox]').length,
          chkTrueLen = 0;
      for(var a = 0; a < totalChkLen; a++){
        var list = $('.check-menu-group').find('input[type=checkbox]').eq(a);
        if(list.prop('checked')){
          chkTrueLen++;
        }
      }
      // 8개 이상 체크 할 경우
      if(chkTrueLen > 8){
        if($(this).prop('checked')){
          $(this).prop('checked', 'false');
          alert('8개 까지만 가능');
          return false;
        }
      }
      if($(this).prop('checked')){
        $('.set-menu-lists').attr('data-changeid', checkID).attr('data-changetext', checkText).trigger('addedlist-change');
      }else{
        $('.set-menu-lists').attr('data-changeid', checkID).attr('data-changetext', checkText).trigger('remove-change');
      }
    });
  }
};