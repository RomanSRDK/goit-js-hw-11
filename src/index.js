import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";

axios.defaults.baseURL = 'https://pixabay.com/api/';
const KEY = '38243771-9bc11714f2bee3e9a851a8bed';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');
let search = '';
let page = 1;
const perPage = 40;
let simpleLightBox;

form.addEventListener('submit', onSearch);
loadMore.addEventListener('click', onLoad);

function onSearch(e) {
  e.preventDefault();
  page = 1;
  search = e.currentTarget.searchQuery.value.trim();
  clean();
  if (search === '') {
    Notiflix.Notify.failure('Field is empty. Please try again.');
    return;
  }
  fetchPhotos(search, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        clean();
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        clean();
        galleryMarkup(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery__link').refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

        if (data.totalHits > perPage) {
          loadMore.classList.add('visible');
        } else {
          loadMore.classList.remove('visible');
        }
      }
    })
    .catch(error => console.log(error));
  form.reset();
}

async function fetchPhotos(search, page, perPage) {
  const response = await axios.get(
    `?key=${KEY}&q=${search}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
  );
  return response;
}

function galleryMarkup(photos) {
  const markup = photos
    .map(photo => {
      const {
        id,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      } = photo;
      return `
                <a class="gallery__link" href="${largeImageURL}">
                    <div class="gallery-item" id="${id}">
                        <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
                        <div class="info">
                        <p class="info-item"><b>Likes:</b>${likes}</p>
                        <p class="info-item"><b>Views:</b>${views}</p>
                        <p class="info-item"><b>Comments:</b>${comments}</p>
                        <p class="info-item"><b>Downloads:</b>${downloads}</p>
                        </div>
                    </div>
                </a>
        `;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

function onLoad() {
  page += 1;
  simpleLightBox.destroy();

  fetchPhotos(search, page, perPage)
    .then(({ data }) => {
      galleryMarkup(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery__link').refresh();

      if (page * perPage > data.totalHits) {
        loadMore.classList.add('visible');
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(error => console.log(error));
}

function clean() {
  gallery.innerHTML = '';
}