
function display_fs_img(img_src) {
  var img_div = document.getElementById("fs_img_div");
  var img_element = document.getElementById("fs_img_img");
  img_element.src = img_src;
  img_div.style.display = 'block';
}

function close_fs_img() {
  var img_div = document.getElementById("fs_img_div");
  var img_element = document.getElementById("fs_img_img");
  img_div.style.display = 'none';
  img_element.src = '';
}

/* add full screen image listeners: */
function load_fs_imgs() {
  var fs_imgs = document.getElementsByClassName("fs_img");
  /* for each image: */
  for (var i = 0; i < fs_imgs.length; i++) {
    fs_imgs[i].addEventListener('click', function(e) {
      display_fs_img(e.target.attributes.src.value);
    });
  }
  /* add close listener: */
  var fs_img_close = document.getElementById("fs_img_close");
  fs_img_close.addEventListener('click', function() {
    close_fs_img();
  });
}

/* on page load: */
window.addEventListener('load', function() {
  /* load full screen images!: */
  load_fs_imgs();
});
