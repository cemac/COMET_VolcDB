(function(){
  var icon_expand = `<img class="icon icons8-Expand-Arrow" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAATklEQVQYV2NkIBIwEqmOAaRQAKr4Aw5NYHmYwgkMDAwFDAwM6IpBisByMKvhAkiKUcSQ3YgsAbINxRZ0z8AUgxSiOAWbr7F6jqTgISooAXv+Div1AkyaAAAAAElFTkSuQmCC" width="10" height="10" alt="Expand arrow">`;
  var icon_collapse = `<img class="icon icons8-Collapse-Arrow" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAUUlEQVQYV6XQ0QkAIAgE0HODRm2URm2EuOhEw48gP/UpquEx7NGhgu00zzjkhkTjgA7AcYRCBAw2OBaMSFNSjrBCWs9rgiyk5cMh+7iv95SvXcNvDiv20PNDAAAAAElFTkSuQmCC" width="10" height="10" alt="Collapse arrow">`;

  // Hide all links on load
  var links = jQuery('.toggleable-links');
  links.addClass('accessibly-hidden');

  // Attach events to all category headers
  var headers = jQuery('.toggleable-header');

  headers.click(function(){
    var category = jQuery(this).attr('id');
    var links = jQuery("#listing-" + category);
    var icon = jQuery("#" + category + " .icon");
    // Visible
    if ( !links.hasClass("accessibly-hidden") ) {
      links.slideUp('fast',function(){
        links.addClass('accessibly-hidden')
             .slideDown(0);
      });
      icon.replaceWith(icon_expand);

    } else { // Hidden
      links.slideUp(0,function(){
        links.removeClass('accessibly-hidden')
             .slideDown('fast');
      });
      icon.replaceWith(icon_collapse);
    }
  });
})();