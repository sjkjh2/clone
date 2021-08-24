$(document).ready(function(){
	initHandler();
});

$(window).onload = function(){
    $(window).trigger('resize');
};

var firstRootWinH = 0;
var rootWinW = 0;
var rootWinH = 0;

var initHandler = function(){
    main();
    gnb();
    subPage();
    resizeInit();
	console.log('initHandler');
}

/* Resize */
var resizeInit = function(){
    firstRootWinH = $(window).innerHeight();
    rootWinW = $(window).innerWidth();
    rootWinH = $(window).innerHeight();

    resizeHandler();

    $(window).on('resize', function(){
        resizeHandler();
    });

    function resizeHandler(){
        rootWinW = $(window).innerWidth();
        rootWinH = $(window).innerHeight();
    }
}

/* Common */
var winW = null,
    winH = null,
    scrollTop = null;

/* Main */
var main = function(){
    if($('.main.home').length){
        mainVisual();
        mainScroll();
        console.log('initMain');
    }
}

/* Sub Page */
var subPage = function(){
    if($('.main.sub').length){
        tabMenu();
        console.log('initSub');
    }
}

/* Main - Scroll */
var mainScroll = function(){
    $(window).on({
        'scroll': function(){
            var winH = $(window).innerHeight(),
                scrollTop = $(document).scrollTop();
            
            var header = $('.header'),
                snb = $('.snb');

            if(scrollTop >= winH - (header.innerHeight())){
                header.addClass('active');
                snb.addClass('active');
            }else{
                header.removeClass('active');
                snb.removeClass('active');
            }
        }
    });
}

/* Main - Gnb */
var gnb = function(){
    var header = $('.header'),
        gnbWrap = header.find('.gnb-wrap'),
        gnbBg = gnbWrap.find('.gnb-bg'),
        gnbHandler = gnbWrap.find('.dep1'),
        gnbFocus = gnbHandler.children('button'),
        dep2 = gnbWrap.find('.dep2'),
        snb = $('.snb');

    var winW = $(window).innerWidth();
    if(winW >= 1203){
        // gnb에 마우스가 올라가면
        gnbHandler.on({
            'mouseover': function(){
                var $this = $(this);
                header.addClass('active');
                $this.addClass('is-on').siblings().removeClass('is-on');
                gnbBg.addClass('is-on');
                dep2.addClass('is-on').attr({'aria-hidden':'false'});
    
                
                dep2.on({
                    'mouseover': function(){
                        var $this = $(this);
                        var dep1 = $this.closest('.dep1');
                        dep1.addClass('is-on').siblings().removeClass('is-on');
                    }
                });
                
                if(header.hasClass('active')){
                    var main = $('.main')
                    main.on({
                        'mouseover': function(){
                            header.removeClass('active');
                            gnbBg.removeClass('is-on');
                            gnbHandler.removeClass('is-on');
                            dep2.removeClass('is-on').attr({'aria-hidden':'true'});;
                        }
                    })
                }
            }
        });
    
        $(window).on({
            'scroll': function(){
                var winH = $(window).innerHeight(),
                    scrollTop = $(document).scrollTop(),
                    topOffset = [],
                    visual = $('.visual-wrap').find('[class*=visual]'),
                    snbItem = snb.find('[data-control]');
    
                if(scrollTop >= winH - (header.innerHeight())){
                    header.addClass('active scroll');
                    gnbFocus.addClass('scroll');
                    snb.addClass('active');
                }else{
                    header.removeClass('active scroll');
                    gnbFocus.removeClass('scroll');
                    snb.removeClass('active');
                };
                
                $(window).resize(function(){
                    snbItem.removeClass('is-on')
                    topOffset = [];
                    $.each(visual, function(){
                        topOffset.push($(this).offset().top);
                    });
                }).trigger('resize');
    
                visual.each(function(i){
                    var $this = $(this);
                    if((scrollTop >= topOffset[i]) && (scrollTop < topOffset[i] + $this.innerHeight())){
                        $('html, body').animate({scrollTop:topOffset[i].top}, 300, 'easeInOutQuint');
                        snbItem.eq(i).addClass('is-on');
                    }else{
                        $('html, body').animate({scrollTop:topOffset[i].bottom}, 300, 'easeInOutQuint');
                        snbItem.eq(i).removeClass('is-on');
                    }
                });
            }
        });

        // gnb에 포커스가 가면
        gnbFocus.on({
            'focus': function(){
                var $this = $(this),
                    lastMenu = $('.dep1:last-child .dep2 li:last-child a');

                header.addClass('active');
                $this.closest('.dep1').addClass('is-on').siblings().removeClass('is-on');
                gnbBg.addClass('is-on');
                dep2.addClass('is-on').attr({'aria-hidden':'false'});

                dep2.on({
                    'focus': function(){
                        var $this = $(this);
                        var dep1 = $this.closest('.dep1');
                        dep1.addClass('is-on').siblings().removeClass('is-on');
                    }
                });

                if(header.hasClass('active')){
                    lastMenu.on({
                        'blur': function(){
                            header.removeClass('active');
                            gnbBg.removeClass('is-on');
                            gnbHandler.removeClass('is-on');
                            dep2.removeClass('is-on').attr({'aria-hidden':'true'});;
                        }
                    })
                };
            }
        });
    }else{
        var menuOpenBtn = $('.gnb-wrap').find('.btn-menu');
        menuOpenBtn.on({
            'click': function(){
                var $this = $(this);
                $this.closest('.gnb-wrap').toggleClass('active');
                $this.siblings('.gnb').attr('aria-hidden', 'false');
                $('.gnb-bg').click(function(){
                    $this.closest('.gnb-wrap').removeClass('active');
                })
                if($('.gnb-wrap').hasClass('active')){
                    $('body').css('overflow', 'hidden');
                    $this.find('span').text('메뉴 닫기');
                }else{
                    $('body').removeAttr('style');
                    $this.find('span').text('메뉴 열기');
                }
            }
        });
    }


    
}

/* Main - Visual */
var mainVisual = function(){
    var snbBtn = $('.snb .list .item button');
    snbBtn.on({
        'click': function(){
            var $this = $(this),
                item = $this.closest('[data-control]'),
                idx = $this.closest('[data-control]').index(),
                visualIdx = item.closest('.snb').siblings('.visual-wrap').find('[data-id]').eq(idx),
                offset = visualIdx.offset();

            $this.closest('[data-control]').addClass('is-on').siblings().removeClass('is-on');
            $('html, body').animate({scrollTop:offset.top}, 300, 'easeInOutQuint');
        },
        
        // snb 버튼 엔터를 누르면...
        'keyup': function(e){
            var $this = $(this),
                item = $this.closest('[data-control]'),
                idx = $this.closest('[data-control]').index(),
                visualIdx = item.closest('.snb').siblings('.visual-wrap').find('[data-id]').eq(idx),
                keyCode = e.keyCode;

            if(keyCode == 13){
                visualIdx.attr('tabindex', '0').focus().siblings().removeAttr('tabindex');

                var lastFocus = $('[data-id]').find('.btn-group:last-child').find('a');
                lastFocus.on({
                    'blur': function(){
                        var $this = $(this),
                            idx = $this.closest('[data-id]').index(),
                            snbIdx = $this.closest('.visual-wrap').siblings('.snb').find('[data-control]').eq(idx).find('button');
            
                        snbIdx.focus();
                    }
                });
            }
        }
    });
}

/* Sub Page - TabMenu */
var tabMenu = function(){
    var tabActive = $('.tab-list .item');

    tabActive.on({
        'click': function(){
            var $this = $(this),
                tab = $(this).find('.tab'),
                tabSinblings = tab.closest('.item').siblings().find('.tab'),
                idx = $this.index(),
                tabPanelIdx = $this.closest('.tab-list').next('.tab-cont').find('.panel').eq(idx);
                console.log(idx);

            /* AddClass */
            tab.addClass('is-current');
            tabSinblings.removeClass('is-current');
            tabPanelIdx.addClass('is-on').siblings().removeClass('is-on');

            /* WAI-ARIA */
            tab.attr({'aria-selected':'true', 'tabindex':'0'});
            tabSinblings.attr({'aria-selected':'false', 'tabindex':'-1'});
            tabPanelIdx.attr({'aria-hidden':'false'}).siblings().attr({'aria-hidden':'true'});
        },
        
        'keyup': function(e){
            var $this = $(this),
                keyCode = e.keyCode || e.which; //키보드 코드값
            
            if(keyCode == 39 || keyCode == 40){ //오른쪽 방향키 이거나 아래 방향키
                
                var nextTab = $this.next().find('.tab'),
                    nextTabSiblings = $this.next().siblings().find('.tab'),
                    panel = $this.closest('.tab-list').next('.tab-cont').find('.panel');

                //tab의 aria-controls 값이 panel의 id값과 연결: 즉 role=panel을 컨트롤 할 수 있는 변수.
                var nextSelectedID = '#' + $this.next().find('.tab').attr('aria-controls');
                
                /* AddClass */
                //tab: tab의 포커스가 이동하면 배경색과 글자 색이 바뀐다.
                nextTab.addClass('is-current');
                nextTabSiblings.removeClass('is-current');

                //panel: 자신은 보이게하고 다른 panel은 보이지 않게 지정한다.
                panel.addClass('is-on').siblings().removeClass('is-on');
                $(nextSelectedID).addClass('is-on').siblings().removeClass('is-on');
                
                /* WAI-ARIA */
                // tab: 다음 tab 요소에 ara-selected=true로 지정하고, 
                // 형제 요소중에 자신 tab 이외의 나머지 tab 요소들을 aria-selected=false로 지정.
                nextTab.attr({'aria-selected':'true', 'tabindex':'0'});
                nextTabSiblings.attr({'aria-selected':'false', 'tabindex':'-1'}); // aria-selected
                
                //tabpanel: tab의 포커스가 이동하면 상응하는 tabpanel의 aria-hidden 값 변경.
                $(nextSelectedID).attr('aria-hidden','false'); // aria-hidden
                $(nextSelectedID).siblings().attr('aria-hidden','true'); // aria-hidden

                nextTab.focus();
                
                
                //마지막 요소에서 오른쪽 방향키나 아래 방향키를 눌렀을 경우
                var lastTabAriaControls = $this.next().prevObject.find('.tab').attr('aria-controls'),
                    tabPanelLastData = $this.closest('.tab-list').next('.tab-cont').find('.panel:last-child').data();

                if(lastTabAriaControls == tabPanelLastData.id){
                    //tab, tabpanel, focus 모두 처음으로 이동
                    var $this = $('.tab-list .item');
                        firstTab =  $('.tab-list').find('.item:first-child').find('.tab'),
                        firstTabSiblings = firstTab.closest('.item').siblings().find('.tab'),
                        firstTabPanel = $('.tab-cont').find('.panel:first-child');

                    /* AddClass */
                    firstTab.addClass('is-current').closest('.item').siblings().find('.tab').removeClass('is-current');
                    firstTabPanel.addClass('is-on').siblings().removeClass('is-on');

                    // /* WAI-ARIA */
                    firstTab.attr({'aria-selected':'true', 'tabindex':'0'});
                    firstTabSiblings.attr({'aria-selected':'false', 'tabindex':'-1'});
                    firstTabPanel.attr('aria-hidden','false').siblings().attr('aria-hidden','true');
                    
                    firstTab.focus();
                }
            }
            if(keyCode == 37 || keyCode == 38){ //왼쪽 방향키 이거나 위쪽 방향키: 주석 설명 오른쪽 방향키 참고

                var prevTab = $this.prev().find('.tab'),
                    prevTabSiblings = $this.prev().siblings().find('.tab'),
                    panel = $this.closest('.tab-list').next('.tab-cont').find('.panel');

                //tab의 aria-controls 값이 panel의 id값과 연결: 즉 왼쪽 방향의 panel을 컨트롤 할 수 있는 변수.
                var prevSelectedID = '#' + $this.prev().find('.tab').attr('aria-controls');
                
                /* AddClass */
                prevTab.addClass('is-current')
                prevTabSiblings.removeClass('is-current');

                panel.addClass('is-on').siblings().removeClass('is-on');
                $(prevSelectedID).addClass('is-on').siblings().removeClass('is-on');
                
                /* WAI-ARIA */
                prevTab.attr({'aria-selected':'true', 'tabindex':'0'});
                prevTabSiblings.attr({'aria-selected':'false', 'tabindex':'-1'});

                $(prevSelectedID).attr('aria-hidden','false');
                $(prevSelectedID).siblings().attr('aria-hidden','true');

                prevTab.focus();

                
                //마지막 요소에서 오른쪽 방향키나 아래 방향키를 눌렀을 경우
                var firstTabAriaControls = $this.prev().prevObject.find('.tab').attr('aria-controls'),
                    tabPanelFirstData = $this.closest('.tab-list').next('.tab-cont').find('.panel:first-child').data();
                
                    console.log($this);
                if(firstTabAriaControls == tabPanelFirstData.id){
                    console.log('aaa');
                    //tab, tabpanel, focus 모두 마지막으로 이동
                    var $this = $('.tab-list .item'),
                        lastTab =  $('.tab-list').find('.item:last-child').find('.tab'),
                        lastTabSiblings = lastTab.closest('.item').siblings().find('.tab'),
                        lastTabPanel = $('.tab-cont').find('.panel:last-child');

                    /* AddClass */
                    lastTab.addClass('is-current').closest('.item').siblings().find('.tab').removeClass('is-current');
                    lastTabPanel.addClass('is-on').siblings().removeClass('is-on');

                    /* WAI-ARIA */
                    lastTab.attr({'aria-selected':'true', 'tabindex':'0'});
                    lastTabSiblings.attr({'aria-selected':'false', 'tabindex':'-1'});
                    lastTabPanel.attr('aria-hidden','false').siblings().attr('aria-hidden','true');
                    
                    lastTab.focus();
                }
            }
        }
    });

};
