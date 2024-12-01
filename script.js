document.addEventListener("DOMContentLoaded", () => {
    console.log("🟠 Cargando...: [Galería | Slider]");
  
    const slider = new Slider();
    slider.init();
  
    console.log("🟢 Cargado con éxito: [Galería | Slider]");
  });
  
  class Slider {
    constructor() {
      this.items = [];
      this.lastSlider = 0;
  
      this.createContainer();
      this.cacheDOMElements();
    }
  
    // Crear contenedor del slider
    createContainer() {
      const sliderContainer = document.getElementById("slider");
  
      const sliderMain = this.createElement("article", {
        id: "slider-main",
        className: "main"
      });
      const navOverlay = this.createElement("article", {
        className: "nav overlay"
      });
      const sliderButtons = this.createElement("article", {
        id: "slider-buttons",
        className: "buttons"
      });
      const sliderImages = this.createElement("article", {
        id: "slider-images",
        className: "images clearfix"
      });
  
      navOverlay.appendChild(sliderButtons);
      sliderMain.appendChild(navOverlay);
      sliderMain.appendChild(sliderImages);
  
      const btnPrevious = this.createButton(
        "previous",
        "btn_previous",
        this.createSVGIcon()
      );
      const btnNext = this.createButton(
        "after",
        "btn_after",
        this.createSVGIcon()
      );
  
      sliderMain.appendChild(btnPrevious);
      sliderMain.appendChild(btnNext);
  
      sliderContainer.appendChild(sliderMain);
      sliderContainer.appendChild(
        this.createElement("div", { className: "imagebg" })
      );
    }
  
    // Carga de elementos del DOM
    cacheDOMElements() {
      this.sliderMain = document.getElementById("slider-main");
      this.sliderButtons = document.getElementById("slider-buttons");
      this.sliderImages = document.getElementById("slider-images");
      this.btnPrevious = document.getElementById("previous");
      this.btnNext = document.getElementById("after");
    }
  
    init() {
      this.fetchItems();
      this.renderSlider();
    }
  
    // Obtener elementos del slider
    fetchItems() {
      const sliderContainer = document.getElementById("slider");
      const sliderItems = Array.from(sliderContainer.querySelectorAll("slide"));
  
      sliderItems.forEach((slide) => {
        const slideAttributes = {};
        const attributes = slide.attributes;
  
        for (let i = 0; i < attributes.length; i++) {
          const attributeName = attributes[i].nodeName;
          const attributeValue = attributes[i].nodeValue;
          slideAttributes[attributeName] = attributeValue;
        }
  
        this.items.push(slideAttributes);
        slide.remove();
      });
    }
  
    // Renderizar slider
    renderSlider() {
      this.items.forEach((item, index) => {
        // Renderizar radios
        const radio = this.renderRadio(this.items.length, index);
  
        radio.addEventListener("change", () => {
          this.lastSlider = this.updateSlider(
            this.items.length - index,
            this.lastSlider
          );
        });
  
        this.sliderMain.insertBefore(radio, this.sliderMain.firstChild);
  
        // renderizar botones labels
        const sliderButton = this.renderSliderButton(item, index);
        this.sliderButtons.appendChild(sliderButton);
  
        // renderizar imagenes
        const sliderImage = this.renderSliderContentMedia(item, index);
        this.sliderImages.appendChild(sliderImage);
      });
  
      // Eventos para la navegación
      this.btnPrevious.addEventListener("click", () => this.navigate(-1));
      this.btnNext.addEventListener("click", () => this.navigate(1));
  
      // Primera carga
      this.lastSlider = this.updateSlider(1, this.lastSlider);
    }
  
    // Navegación del slider
    navigate(direction) {
      const totalItems = this.items.length;
      let newIndex = this.lastSlider + direction;
  
      if (newIndex > totalItems) {
        newIndex = 1;
      } else if (newIndex < 1) {
        newIndex = totalItems;
      }
  
      const label = document.querySelector(`label[for="radio_media${newIndex}"]`);
      const iframes = document.querySelectorAll(".youtube-video");
  
      if (label) {
        label.click();
      }
  
      iframes.forEach((iframe) => {
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          "*"
        );
      });
  
      this.lastSlider = newIndex;
    }
  
    // Actualizar slider
    updateSlider(index, lastSlider) {
      const selectorBase = `#slider input:nth-child(${index}):checked`;
      const selectorLastBase = `#slider input:nth-child(${lastSlider})`;
  
      const selectorImages = `${selectorBase} ~ .images > [id^="content_media"]:nth-child(${index})`;
      const selectorButtons = `${selectorBase} ~ .nav > .buttons > label:nth-child(${index}) > img`;
      const selectorLastImages = `${selectorLastBase} ~ .images > [id^="content_media"]:nth-child(${lastSlider})`;
      const selectorLastButtons = `${selectorLastBase} ~ .nav > .buttons > label:nth-child(${lastSlider}) > img`;
      const selectorPosition = `${selectorBase} ~ .images`;
  
      const sliderImages = document.querySelector(selectorImages);
      const sliderButtons = document.querySelector(selectorButtons);
      const sliderLastImages = document.querySelector(selectorLastImages);
      const sliderLastButtons = document.querySelector(selectorLastButtons);
      const sliderPosition = document.querySelector(selectorPosition);
  
      if (sliderImages && sliderButtons) {
        sliderImages.classList.toggle("active-images", true);
        sliderButtons.classList.toggle("active-buttons", true);
        sliderButtons.parentElement.classList.toggle("active-label", true);
      }
  
      if (sliderLastImages && sliderLastButtons) {
        sliderLastImages.classList.toggle("active-images", false);
        sliderLastButtons.classList.toggle("active-buttons", false);
        sliderLastButtons.parentElement.classList.toggle("active-label", false);
        sliderPosition.style.left = `-${
          (index - 1) * sliderImages.offsetWidth
        }px`;
      }
  
      return index;
    }
  
    // Función para renderizar los radios
    renderRadio(length, index) {
      const radio = this.createElement("input", {
        type: "radio",
        name: "nav",
        id: `radio_media${length - index}`
      });
  
      radio.setAttribute("checked", index === 0 ? "checked" : null);
  
      return radio;
    }
  
    // Función para renderizar los botones
    renderSliderButton(item, index) {
      const handlerOfTypes = {
        img: this.createImage,
        video: this.createYouTubeImage
      };
  
      const label = this.createElement("label", {
        htmlFor: `radio_media${index + 1}`
      });
      const media = handlerOfTypes[item.type].call(this, item, index);
      label.appendChild(media);
      return label;
    }
  
    // Función para renderizar el contenido multimedia
    renderSliderContentMedia(item, index) {
      const handlerOfTypes = {
        img: this.createImage,
        video: this.createYouTubeVideo
      };
  
      const article = this.createElement("article", {
        id: `content_media${index + 1}`
      });
      const media = handlerOfTypes[item.type].call(this, item, index);
      article.appendChild(media);
      return article;
    }
  
    // Funciones para renderizar los elementos multimedia de imagen
    createImage(item) {
      return this.createElement("img", {
        src: item.url,
        alt: item.alternative_text
      });
    }
  
    // Funciones para renderizar los elementos multimedia de imagen de YouTube
    createYouTubeImage(item) {
      const videoIdMatch = item.url.match(/[?&]v=([^&]+)/);
      const url = videoIdMatch
        ? `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`
        : "";
  
      return this.createElement("img", { src: url, alt: item.alternative_text });
    }
  
    // Funciones para renderizar los elementos multimedia de video de YouTube
    createYouTubeVideo(item, index) {
      const videoIdMatch = item.url.match(/[?&]v=([^&]+)/);
      const url = videoIdMatch
        ? `https://www.youtube.com/embed/${videoIdMatch[1]}?enablejsapi=1&controls=0`
        : "";
  
      return this.createElement("iframe", {
        src: url,
        title: item.alternative_text,
        id: `media${index + 1}`,
        className: "youtube-video",
        frameborder: "0",
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        allowfullscreen: true
      });
    }
  
    // Función para crear elementos HTML
    createElement(tag, attributes = {}) {
      const element = document.createElement(tag);
      Object.keys(attributes).forEach((attr) => {
        if (attributes[attr] !== null) {
          element[attr] = attributes[attr];
        }
      });
  
      return element;
    }
  
    // Función para crear botones
    createButton(id, className, innerHTML) {
      const button = this.createElement("button", { id, className });
      button.innerHTML = innerHTML;
      return button;
    }
  
    // Función para crear iconos SVG
    createSVGIcon() {
      return `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 1 1-.708.708L8.5 5.707z"/>
              </svg>
          `;
    }
  }
