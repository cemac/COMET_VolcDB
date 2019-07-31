// Taken from  https://github.com/universityofleeds/volcano-database
(function($){
    $(document).ready(function(){
        $('.location-toggle').on('click', 'a', function(e) {
            e.preventDefault();
            $(this).toggleClass('active');
            $(this).parent().next('ul.volcano-listing').toggleClass('active');
        });
        if ($('#volcano_search').length) {
            var v_data = []
            $('.volcano-listing a').each(function(){
                v_data.push({'label':$(this).text(),'value':$(this).attr('href')});
            });
            var input = document.getElementById('volcano_search');
            new Awesomplete( input, {
                    list: v_data
                }
            );
            input.addEventListener('awesomplete-selectcomplete', function(e){
                if ( e.text && e.text.value && '' !== e.text.value ) {
                    this.value='Redirecting... please wait';
                    this.disabled=true;
                    window.location.href = e.text.value;
                }
            });
        }
    });
})(jQuery);
