// === Глобальные переменные ===
let userId = null;
let inputImageBase64 = null;
const API_URL = './api/api_qe.php';




// === Глобальные переменные ===

let allImages = [];        // Все изображения от сервера
let currentPage = 1;       // Текущая страница
const generateImageCheckTime = 3000
let IMAGES_PER_PAGE = 16; // По 10 пар на страницу
const duration = 60; // секунд
const oneimagedurationforqueue = 40; // секунд
let lastImagesHash = null;
let outputcontainerContent;
let currentTab = 'examples'; // 'my' или 'examples'
let examplesData = []; // Кэшируем примеры, чтобы не запрашивать каждый раз
let progressIntervalId = null;
let ocheredIntervalId = null;
let readyimgUrl = '';
let currentpromptSrc = '';
let generator_url = '';
let currentViewMode = '';

const samples = [
  // {fname:"wood.jpg", title:"Дерево", prompt:"Ремейк в стиле резьбы по дереву маори (маорийской деревянной резьбы), часто с использованием вырубленных узоров, культуры маори, искусства Новой Зеландии."},
  
  {fname:"dynamic.jpg", title:"Технодвиж", prompt:"Ремейк в артистичном движении подчёркивая скорость стиле, технологии и будущее, динамичные линии и композиции."},
  // {fname:"geometric.jpg", title:"Геометрический", prompt:"Ремейк в стиле Геометрическая абстракция, геометрическая абстракция, часто с использованием математической точности, геометрических форм или строгой композиции."},
  {fname:"manga.jpg", title:"Манга", prompt:"Ремейк в манга стиле: яркие, энергичные, детализированные, иконические, японские комиксы."},
  //{fname:"minecraft.jpg", title:"Майнкрафт", prompt:"Ремейк в стиле Minecraft: блочный, пиксельный, яркие цвета, узнаваемые персонажи и предметы, игровые ассеты"},
  {fname:"aqua.jpg", title:"Акварель", prompt:"Ремейк в стиле акварельной иллюстрации, мягкие переливы красок, размытые края, бумажная текстура."},
  {fname:"mosaic.jpg", title:"Мозаика", prompt:"Ремейк в стиле мозаики, tesserae - четкие мозаичные кусочки, видимые контуры кусочков, узоры и декоративные поверхности."},
  {fname:"retro_futuristic.jpg", title:"Ретро-футуристик", prompt:"Ремейк в стиле ретро-футуризма. Винидж-сайенс-фикшн, стиль 50-х и 60-х годов, атомный век, яркий, детализированный."},
  {fname:"vibrant.jpg", title:"Яркий фовизм", prompt:"Ремейк в Vibrant fauvism, плоский узор, изогнутые линии, выразительная искаженность"},
  {fname:"neon.jpg", title:"Неон", prompt:"Ремейк в стиле яркого неонового освещения. Неоновые трубы с подсветкой, яркие светящиеся цвета, сложные изогнутые формы, сочные розовый и синий оттенки"},
  {fname:"children_book.jpg", title:"Детская книга", prompt:"Ремейк в стиле цветной детской иллюстрации, яркой и воображаемой."},
  {fname:"wood.jpg", title:"Дерево", prompt:"Ремейк в стиле резьбы по дереву, множество сложных резных узоров, темное дерево и лакировка."},
  {fname:"vyazaniy.jpg", title:"Вязаный", prompt:"Сделай обьект целиком из шерстяной вязки. На фоне новогоднего ощущения праздника."},
  {fname:"gold.jpg", title:"Золото", prompt:"Ремейк в стиле ювелирного украшения из желтого и белого золота. Сложные формы, ощущение дорого и богато. На дорогом светлом фоне."},
  {fname:"minimalism.jpg", title:"Минимализм", prompt:"Ремейк в стиле минимализма, используя плавные геометрические формы и минимум цветов"},
  {fname:"art_deco.jpg", title:"Ар-деко", prompt:"Перерисуй в стиле ар-деко"},
  {fname:"modern.jpg", title:"Модерн", prompt:"Перерисуй в стиле ар-деко: стремление к геометрическим, блочным цветам, глянцевым черным акцентам и напольным покрытиям и простым светлым стенам"},

//!Перерисуй в стиле hand draw с минимальным количеством цветов и линий
//!Ремейк в стиле минимализма, используя плавные геометрические формы и минимум цветов
// Сделай в стиле флэт вай
    
    
// Сделай из фотографии стильный пастозный этюд маслом на холсте. Зима. Первый снег. Нежные оттенки    /  Сделай из фотографии стильный пастозный этюд маслом на холсте. Август. Рассвет.
  // Ремейк в стиле импрессионизма, мазки кистью, свет и атмосфера, нежные переливы цвета.
  // Ремейк в стиле поп-арт.
  {fname:"gravura.jpg", title:"Гравюра", prompt:"нарисуй в стиле гравюры"},
  //{fname:"bw.jpg", title:"Чб", prompt:"Перерисуй в стиле силуэтной графики, только два цвета: белый и черный"},
  {fname:"transparent.jpg", title:"Прозрачный фон", prompt:"Сделай на прозрачном фоне"}
];



function createSamplesGallery() {
  const galleryContainer = document.getElementById('gallery-container-samples');
  if (!galleryContainer) return;
  
  // Очищаем контейнер
  galleryContainer.innerHTML = '';
  
  // Создаем элементы галереи
  samples.forEach((sample, index) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.innerHTML = `
      <img src="images/${sample.fname}" alt="${sample.title}">
      <div class="item-title">${sample.title}</div>
    `;
    
    // Добавляем обработчик клика
    galleryItem.addEventListener('click', function() {
      const promptTextarea = document.getElementById('prompt');
      if (promptTextarea && sample.prompt) {
        promptTextarea.value = sample.prompt;
        promptTextarea.dispatchEvent(new Event('input')); // Для активации событий
      }
    });
    
    galleryContainer.appendChild(galleryItem);
  });
}


// Простая хэш-функция для строки
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) & 0xFFFFFFFF;
  }
  return hash;
}


// === Получение или создание пользователя ===
async function getUserId() {
  const savedId = localStorage.getItem('uid');
  if (savedId) {
    userId = parseInt(savedId);
    console.log('Using existing user ID:', userId);
    return;
  }

  try {
    const response = await $.post(API_URL, JSON.stringify({
      method: 'getUser',
      user_id: -1,
      host_from: window.location.hostname
    }), 'json');

    
      
    if (response.error) {
      alert('Ошибка: ' + response.error);
      return;
    }

    userId = response.user?.id || null;
    if (userId) {
      localStorage.setItem('uid', userId);
      console.log('New user created:', userId);
    } else {
      alert('Не удалось получить ID пользователя');
    }
  } catch (err) {
    console.error('Failed to get user ID:', err);
    alert('Ошибка соединения с сервером');
  }
}

// === Обработка загрузки изображения ===
// function handleImageUpload(e) {
//   const file = e.target.files[0];
//   if (!file) return;

//   // Проверяем MIME-тип
//   const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//   if (!allowedTypes.includes(file.type.toLowerCase())) {
//     alert('Пожалуйста, загрузите изображение в формате JPEG или PNG.');
//     // Сбрасываем input, чтобы при повторном клике файл можно было выбрать
//     $('#image-upload').val('');
//     return;
//   }

//   const reader = new FileReader();
//   reader.onload = function (ev) {
//     inputImageBase64 = ev.target.result;
//     $('#input-container').html(`<img src="${inputImageBase64}" alt="Input" />`);
//   };
//   reader.readAsDataURL(file);
// }
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  // Проверка формата
  if (!allowedExtensions.some(ext => fileName.endsWith(ext))) {
    alert('Разрешены только файлы: .jpg, .jpeg, .png');
    $('#image-upload').val('');
    return;
  }

  if (!allowedTypes.includes(fileType)) {
    alert('Неподдерживаемый формат. Используйте JPEG или PNG.');
    $('#image-upload').val('');
    return;
  }

  const reader = new FileReader();

  reader.onload = function (ev) {
    const imgSrc = ev.target.result;
    const img = new Image();

    img.onload = function () {
      // Проверка минимального размера
      if (img.width < 100 || img.height < 100) {
        alert(`Изображение слишком маленькое. Минимум: 100×100. Сейчас: ${img.width}×${img.height}px.`);
        $('#image-upload').val('');
        return;
      }

      // Исходные размеры
      let { width, height } = img;
      let shouldResize = false;

      // Максимальная сторона
      const MAX_DIMENSION = 2000;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        shouldResize = true;
      }

      // Если файл тяжёлый (>10 МБ), тоже ресайзим, даже если чуть больше 2000px
      const MAX_FILE_SIZE = 4 * 1024 * 1024; // 10 МБ
      const isLargeFile = file.size > MAX_FILE_SIZE;

      if (isLargeFile && !shouldResize) {
        // Если файл большой, но не по размеру — всё равно проверим, не стоит ли уменьшить
        // (например, PNG с высокой детализацией)
        shouldResize = true;
      }

      // Если нужно — ресайзим
      if (shouldResize) {
        // Пропорционально уменьшаем
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      // Создаём canvas для ресайза
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;

      // Улучшаем качество ресайза
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high'; // Лучшее качество

      // Рисуем изображение с новыми размерами
      ctx.drawImage(img, 0, 0, width, height);

      // Replace transparency with gray
      replaceTransparencyWithGray(ctx);

      // Экспортируем обратно в base64
      // Для JPEG — можно сжать (качество 0.95), PNG — остаётся как есть
      const isJPEG = fileType === 'image/jpeg' || fileType === 'image/jpg';
      const mimeType = isJPEG ? 'image/jpeg' : 'image/png';
      const quality = isJPEG ? 0.95 : undefined; // 95% качества для JPEG

      canvas.toBlob(
        function (blob) {
          const blobReader = new FileReader();
          blobReader.onload = function (e) {
            inputImageBase64 = e.target.result; // Обновлённый, уменьшенный Base64

            // Отображаем уменьшенное изображение
            // $('#input-container').html(`
            //   <div style="text-align: center;">
            //     <img src="${inputImageBase64}" alt="Input" />
            //     <div style="margin-top: 6px; color: #8bc34a; font-size: 13px;">
            //       ${shouldResize ? 'Уменьшено до ' : ''}${width}×${height}px
            //     </div>
            //   </div>
            // `);
            $('#input-container').html(`
                <img src="${inputImageBase64}" alt="Input" />
            `);

            // Если было уменьшение — показать уведомление
            if (shouldResize) {
              console.log(`Изображение уменьшено с ${img.width}×${img.height} до ${width}×${height}`);
            }
          };
          blobReader.readAsDataURL(blob);
        },
        mimeType,
        quality
      );
    };

    img.onerror = function () {
      alert('Не удалось загрузить изображение. Файл повреждён или имеет неверный формат.');
      $('#image-upload').val('');
    };

    img.src = imgSrc;
  };

  reader.readAsDataURL(file);
}

function redrawPreloader(startProgressProcent){  
    const $progressContainer = $('#progress-container');
    const $progressBar = $('#progress-bar');
    
    
    $progressContainer.show();
    $progressBar.width('0%');
  
    
    let timeLeft = duration;
    
    timeLeft = timeLeft - Math.round(duration * startProgressProcent / 100);

  progressIntervalId = setInterval(() => {
    timeLeft--;
    const width = ((duration - timeLeft) / duration) * 100;
    $progressBar.width(`${width}%`);
    
    if (timeLeft <= 0) {
      clearInterval(progressIntervalId);
      progressIntervalId = null;
      $progressContainer.fadeOut(500); // плавно скрываем
    }
  }, 1000);
}

// === Отправка запроса на генерацию ===
async function generateImage() {
    const $prompt = $('#prompt');
    const promptValue = $prompt.val().trim();
    const $inputContainer = $('#input-container');
    
    // Удаляем старую подсказку, если есть
    $('#prompt-tooltip').remove();
    
    // --- ПРОВЕРКА: ЗАГРУЖЕНО ЛИ ИЗОБРАЖЕНИЕ ---
    if (!inputImageBase64) { //"data:image/jpeg;base64,/9j/4AA...
        // Меняем текст на красный
        $inputContainer
          .html('<span class="fs-5" style="color:#ff3333; position: absolute;">Загрузи картинку</span>')
          .addClass('error');

        // Через 2 секунды возвращаем обратно (опционально)
        setTimeout(() => {
          if (!$inputContainer.find('img').length && !$inputContainer.hasClass('hovered')) {
            $inputContainer.html('<span class="fs-5" style="color:#4bccff; position: absolute;">Загрузи картинку</span>');
          }
        }, generateImageCheckTime);

        // Подсветка при наведении или клике — возвращаем нормальный текст
        $inputContainer.addClass('hovered').one('mouseenter click', function () {
          $inputContainer.removeClass('hovered');
          if (!$inputContainer.find('img').length) {
            $inputContainer.html('<span class="fs-5" style="color:#4bccff; position: absolute;">Загрузи картинку</span>');
          }
        });

        return; // Прерываем выполнение
    }

    // --- ПРОВЕРКА: ЗАПОЛНЕН ЛИ ПРОМПТ ---
    if (!promptValue) {
        // Подсвечиваем поле
        $prompt.addClass('invalid');

        // Создаём подсказку
        const placeholderText = $prompt.attr('placeholder');
        const tooltip = $(`
          <div id="prompt-tooltip" class="fs-6">${placeholderText}</div>
        `).appendTo($prompt.parent());

        // Показываем подсказку
        setTimeout(() => tooltip.addClass('show'), 10);

        // Убираем подсветку и подсказку при фокусе
        $prompt.one('focus', function () {
          $prompt.removeClass('invalid');
          $('#prompt-tooltip').remove();
        });

        // Также убираем, если пользователь что-то ввёл
        $prompt.one('input', function () {
          $prompt.removeClass('invalid');
          $('#prompt-tooltip').remove();
        });

        return; // Прерываем выполнение
    } else {
        // Если поле не пустое — убираем возможную ошибку
        $prompt.removeClass('invalid');
        $('#prompt-tooltip').remove();
    }

    const $btn = $('#btn-generate');
    const $progressContainer = $('#progress-container');
    const $progressBar = $('#progress-bar');
    const $useResultBtn = $('#btn-use-result');
  

  // Блокируем кнопку
    $('#main').css('pointer-events', 'none');
    $('#main').css('opacity', '0.5');
    $prompt.prop('disabled', true);
    $btn.prop('disabled', true).text('Генерация...');
    $useResultBtn.hide();

  // Очищаем предыдущий таймер, если он был
  if (progressIntervalId) {
    clearInterval(progressIntervalId);
    progressIntervalId = null;
  }

    // redrawPreloader(0);
    
//   // Показываем прогресс
//   $progressContainer.show();
//   $progressBar.width('0%');
  
  
//   let timeLeft = duration;

//   progressIntervalId = setInterval(() => {
//     timeLeft--;
//     const width = ((duration - timeLeft) / duration) * 100;
//     $progressBar.width(`${width}%`);
    
//     if (timeLeft <= 0) {
//       clearInterval(progressIntervalId);
//       progressIntervalId = null;
//       $progressContainer.fadeOut(500); // плавно скрываем
//     }
//   }, 1000);

  try {
    // Получаем размеры изображения
    const img = new Image();
    img.src = inputImageBase64;
    
    // Функция для отправки запроса на генерацию
    function sendGenerationRequest(width, height) {
      const params = {
        method: 'addNew',
        user_id: userId,
        params: {
          prompt: promptValue,
          initimg: [inputImageBase64],
          batch_size: 1,
          iterations: 1,
          steps: 20,
          cfg_scale: 7,
          sampler_index: 'Euler',
          initimgparams:{
            w: width,
            h: height
          }
        }
      };
      return $.post(API_URL, JSON.stringify(params), 'json');
    }

    // Функция для обработки ответа от сервера
    function handleResponse(response) {
      if (response.error) {
        alert('Ошибка: ' + response.error);
      } else if (response.image_id) {
        checkQueueStatus();
      } else {
        alert('Неизвестный ответ от сервера');
      }
    }

    
    // Ждем загрузки изображения для получения размеров
    img.onload = async function() {
      const width = img.width;
      const height = img.height;
      
      try {
        const response = await sendGenerationRequest(width, height);
        handleResponse(response);
      } catch (err) {
        console.error('Request failed:', err);
        alert('Ошибка отправки запроса');
      }
    };
    
    // Обработка ошибки загрузки изображения
    img.onerror = async function() {
      console.error('Ошибка загрузки изображения для получения размеров');
      // Отправляем запрос без размеров
      try {
        const response = await sendGenerationRequest(-1, -1);
        handleResponse(response);
      } catch (err) {
        console.error('Request failed:', err);
        alert('Ошибка отправки запроса');
      }
    };
    
  } catch (err) {
    console.error('Request failed:', err);
    alert('Ошибка отправки запроса');
  } finally {
    
  }
}



async function getMyPict(forceRender = false) {
  if (!userId) return { images: [] };

  try {
    const response = await $.post(API_URL, JSON.stringify({
      method: 'getMy',
      user_id: userId,
      type: 'qe'
    }), 'json');

    if (response.error) {
      console.error('Ошибка получения результата:', response.error);
      return { images: [] };
    }

    const newImages = response.images || [];

    // Сортируем по id или created, чтобы порядок был стабильным
    newImages.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    // Генерируем хэш текущих данных
    const newHash = hashCode(JSON.stringify(newImages));

    // Проверяем, изменились ли данные
    if (!forceRender && newHash === lastImagesHash) {
      // Нет изменений — ничего не делаем
      return response;
    }

    // Данные изменились — обновляем
    allImages = newImages;
    lastImagesHash = newHash;
      
      
    // === Управление вкладкой "Мои картинки" ===
    const $tabMy = $('#tab-my');
    if (allImages.length > 0) {
      $tabMy.show();
        $('#tab-my').click();
    } else {
      $tabMy.hide();
      // Если нет своих картинок — переключаемся на "Примеры"
      if (currentTab === 'my') {
        currentTab = 'examples';
        $tabMy.removeClass('active');
        $('#tab-examples').addClass('active');
        loadExamples();
      }
      // При первом запуске нового пользователя устанавливаем минимальную высоту
      //$('#container').addClass('min-height');
      $('#left .image-container').addClass('min-height');
      $('#right .image-container').addClass('min-height');
      
    }
    // Только теперь перерисовываем
    renderHistory();
    toggleViewMode();
    // Перерисовываем только если мы на вкладке "Мои"
    // if (currentTab === 'my') {
    //   renderHistory();
    // }

    return response;

  } catch (err) {
    console.error('Failed to fetch result:', err);
    // Повторить через 2 секунды
    setTimeout(() => getMyPict(), 5000);
    return { images: [] };
  }
}

async function loadExamples() {
  if (examplesData.length > 0) return; // Уже загружены

  try {
    const response = await $.post(API_URL, JSON.stringify({
      method: 'getBest',
      user_id: userId,
      type: 'qe'
    }), 'json');

    if (response.error) {
      console.error('Ошибка загрузки примеров:', response.error);
      return;
    }

    examplesData = response.images || [];
  } catch (err) {
    console.error('Failed to fetch examples:', err);
    // Повторить один раз
    setTimeout(async () => {
      if (examplesData.length === 0) await loadExamples();
    }, 5000);
  }
}
function renderExamples() {
  const container = $('#gallery-container');
  container.empty();

  if (examplesData.length === 0) {
    container.append('<p>Пока нет примеров.</p>');
    return;
  }

  examplesData.forEach(item => {
    try {
      const params = JSON.parse(item.params);
      const prompt = params.prompt || '';
      const inputImgSrc = `outputs/qe/in/${item.input_image}`;
      const outputImgSrc = item.output_image;

      // const itemHtml = `
      //   <div class="history-item">
      //     <div class="col-12 col-md-5 image-wrapper">
      //       <img src="${inputImgSrc}" alt="Input" />
      //     </div>
      //     <div class="col-12 col-md-2 history-prompt">
      //       <span style="color: #b5b7c3; font-weight: 600;">${prompt}</span>
      //       <span style="color: #857f7f; font-weight: bold;"> →</span>
      //     </div>
      //     <div class="col-12 col-md-5 image-wrapper">
      //       <img src="${outputImgSrc}" alt="Output" />
      //     </div>
      //   </div>
      // `;

      const promptEncoded = encodeURIComponent(prompt); 
        
      const itemHtml = `
      <div class="history-item list-item">
        <div class="col-12 col-md-5 image-wrapper" style="position: relative;">
          <img src="${inputImgSrc}" alt="Input" />
          <button class="take-as-source-btn" data-img-src="${inputImgSrc}" data-prompt="${promptEncoded}">взять как исходник</button>
        </div>
        <div class="col-12 col-md-2 history-prompt">
          <span style="font-weight: 600;">${prompt}</span><span style="color: #857f7f; font-weight: bold;"> →</span>
          <button class="take-as-prompt-btn" data-prompt="${promptEncoded}">взять как запрос</button>
        </div>
        <div class="col-12 col-md-5 image-wrapper" style="position: relative;">
          <img src="${outputImgSrc}" alt="Output" />
          <button class="take-as-source-btn" data-img-src="${outputImgSrc}" data-prompt="${promptEncoded}">взять как исходник</button>
        </div>
      </div>
    `;
      container.append(itemHtml);
    } catch (e) {
      console.error('Error parsing example:', item, e);
    }
  });
}
function renderHistory() {
  const container = $('#gallery-container');

  // Защита от undefined
  if (!Array.isArray(allImages)) allImages = [];
    
  const totalItems = allImages.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / IMAGES_PER_PAGE));
  const start = (currentPage - 1) * IMAGES_PER_PAGE;
  const end = start + IMAGES_PER_PAGE;
  const pageItems = allImages.slice(start, end);

  // Очистить контейнер
  container.empty();

  if (pageItems.length === 0) {
    container.append('<p>Пока нет сгенерированных изображений.</p>');
    $('.page-info').text('Страница 1');
    $('.prev-page').prop('disabled', true);
    $('.next-page').prop('disabled', true);
    return;
  }

  // Отрисовка каждой пары
  pageItems.forEach(item => {
    try {
      // Парсим параметры, чтобы получить prompt
      const params = JSON.parse(item.params);
      const prompt = params.prompt || '';

      // Формируем пути
      const inputImgSrc = `outputs/qe/in/${item.input_image}`;
      const outputImgSrc = item.output_image; // уже полный путь от outputs

      const promptEncoded = encodeURIComponent(prompt);
        
        const itemHtml = `
      <div class="history-item list-item">
        <div class="image-wrapper-sourcepict" style="position: relative;">
          <img src="${inputImgSrc}" alt="Input" />
          <button class="take-as-source-btn" data-img-src="${inputImgSrc}" data-prompt="${promptEncoded}">взять как исходник</button>
        </div>
        <div class="history-prompt">
          <span style="font-weight: 600;">${prompt}</span><span style="color: #857f7f;font-weight: bold;"> →</span>
          <button class="take-as-prompt-btn" data-prompt="${promptEncoded}">взять как запрос</button>
        </div>
        <div class="image-wrapper" style="position: relative;">
          <img src="${outputImgSrc}" alt="Output" />
          <button class="take-as-source-btn" data-img-src="${outputImgSrc}" data-prompt="${promptEncoded}">взять как исходник</button>
          <button class="download-btn" data-img-src="${outputImgSrc}" title="Скачать">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g fill="currentColor"><path d="M9 7.826V1H7v6.826L4.392 5.59L3.09 7.108L8 11.318l4.91-4.21l-1.302-1.518z"/><path d="M3 13v-3H1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3h-2v3z"/></g></svg>
          </button>
        </div>
        <button class="delete-btn" data-image-id="${item.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1024 1024"><path fill="currentColor" d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32z"/></svg>
        </button>
      </div>
    `;
      container.append(itemHtml);
    } catch (e) {
      console.error('Error parsing item:', item, e);
    }
  });

    // Обновить ВСЕ панели пагинации
    $('.page-info').text(`Страница ${currentPage} из ${totalPages}`);
    $('.prev-page').prop('disabled', currentPage <= 1);
    $('.next-page').prop('disabled', currentPage >= totalPages);
}


// === Получение результата ===
async function fetchResult(imageId) {
    
  try {
    const myImgResponse = await getMyPict();

    const images = myImgResponse.images || [];
    const result = images.find(img => parseInt(img.status_id) == parseInt(imageId));

    if (result && result.output_image) {
      
        const imgUrl = result.output_image;
        $('#output-container').html(`
          <img src="${imgUrl}" alt="Result" />
          <button class="download-btn download-btn-res" data-img-src="${imgUrl}" title="Скачать">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g fill="currentColor"><path d="M9 7.826V1H7v6.826L4.392 5.59L3.09 7.108L8 11.318l4.91-4.21l-1.302-1.518z"/><path d="M3 13v-3H1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3h-2v3z"/></g></svg>
          </button>
        `);
        if (!$('#output-container').hasClass('image-container-hover')) $('#output-container').addClass('image-container-hover');
        
        
        const $useResultBtn = $('#btn-use-result');
        $useResultBtn.show();
        // === Показываем кнопку "переместить" ===        
        readyimgUrl = imgUrl;
        
        // Успешно — скрываем прогресс и разблокируем кнопку
        $('#progress-container').fadeOut(300);
        $('#progress-bar').width('0%');
        $('#main').css('pointer-events', 'all');
        $('#main').css('opacity', '1');
        $('#prompt').prop('disabled', false);
        $('#btn-generate').prop('disabled', false).text('Создать изображение');
        
    } else {
      // Повторить через 2 секунды
      setTimeout(() => fetchResult(imageId), 5000);
    }
  } catch (err) {
    console.error('Failed to fetch result:', err);
    setTimeout(() => fetchResult(imageId), 5000);
  }
   
}



function hideLoadingIfReady() {
  
    $('#loading-status').hide()

    // Показываем интерфейс
      $('#tabs').fadeIn(200);
      $('#gallery-container').fadeIn(200);
      if (currentTab === 'my') {
        $('.pagination-wrapper').fadeIn(200);
      }

  
}








// === ПРОВЕРКА ОЧЕРЕДИ И ВОССТАНОВЛЕНИЕ ПРОГРЕССА И ИЗОБРАЖЕНИЯ ===
async function checkQueueStatus(fromButton) {
  try {
    const response = await $.post(API_URL, JSON.stringify({
      method: 'getOchered', // Используем специальный метод для очереди
      user_id: userId
    }), 'json');

    if (response.error) {
      console.error('Ошибка при проверке очереди:', response.error);
      // Повторить попытку позже
      setTimeout(checkQueueStatus, 5000);
      return;
    }

    const { userwaiting, waitingcount, userwaitingparams } = response;

    const $progressContainer = $('#progress-container');
    const $progressBar = $('#progress-bar');
    const $btn = $('#btn-generate');
    const $prompt = $('#prompt');
    const $inputContainer = $('#input-container');

      var thisImageInGeneration = false;
      var currentWaitingTime = 20000;
      var startPreloaderProcent = 15;
      
      if (waitingcount==0){
          
          // clearInterval(progressIntervalId);
          // progressIntervalId = null;
          thisImageInGeneration = true;
          currentWaitingTime = generateImageCheckTime;
      }
      if (fromButton){
          startPreloaderProcent = 2;
      }
      
      
    if (userwaiting) {
      // === Восстановление исходного изображения ===
      // Проверяем, есть ли параметры ожидающей задачи и путь к исходнику
      let inputImageRestored = false;
      if (userwaitingparams && userwaitingparams !== "0") {
        try {
          const parsedParams = JSON.parse(userwaitingparams);
          if (parsedParams.params) {
              
    
            if (thisImageInGeneration && !progressIntervalId){
                redrawPreloader(startPreloaderProcent);
            }
              
              
            const taskParams = JSON.parse(parsedParams.params); // params внутри userwaitingparams - это строка JSON
            let initImgPath = null;

            if (Array.isArray(taskParams.initimg) && taskParams.initimg.length > 0) {
              // Если initimg - массив (как в примере API), берем первый элемент
              initImgPath = `outputs/qe/in/${taskParams.initimg[0]}`;
            } else if (typeof taskParams.initimg === 'string' && taskParams.initimg) {
              // Если initimg - строка
              initImgPath = 'outputs/qe/in/'+JSON.parse(taskParams.initimg)[0];
            }

            if (initImgPath) {
              // Проверим, а не отображается ли уже это изображение?
              // Это поможет избежать повторной вставки при каждом setInterval
              const currentImg = $inputContainer.find('img');
              if (currentImg && currentImg.length === 0) {
                 // Убедимся, что в контейнере нет других элементов, кроме img
                 // или что он вообще пуст/содержит только placeholder
                 const containerHtml = $inputContainer.html().trim();
                 const isPlaceholder = containerHtml.includes('Загрузи картинку') || containerHtml === '';
                 if (isPlaceholder || currentImg.length > 0) {
                    $inputContainer.html(`<img src="${initImgPath}" alt="Input (ожидание)" />`);
                    // Также сохраним его в inputImageBase64, чтобы кнопка "Переместить результат" работала
                    // если пользователь захочет использовать это изображение после завершения
                    // Для этого нужно загрузить изображение и конвертировать в base64
                    // Это опционально, но логично
                    fetch(initImgPath)
                      .then(res => res.blob())
                      .then(blob => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          inputImageBase64 = reader.result; // Сохраняем base64
                          console.log("Исходное изображение из очереди загружено в inputImageBase64");
                        };
                        reader.readAsDataURL(blob);
                      })
                      .catch(err => console.error("Не удалось загрузить исходное изображение для base64:", err));
                 }
                 inputImageRestored = true;
              } else {
                  // Изображение уже отображается - ничего не делаем
                  inputImageRestored = true;
              }
            }
          }
        } catch (parseErr) {
          console.warn("Не удалось распарсить userwaitingparams для восстановления изображения:", parseErr);
        }
      }

      // Независимо от того, был ли показан прогресс-бар, начинаем опрос результата
      // Но только если он еще не запущен (проверим через флаг)
      // if (!window.isPollingForResult) {
      //    window.isPollingForResult = true;
      //    pollForResult(); // Начинаем опрос результата
      // }
        
        $('#main').css('pointer-events', 'none');
        $('#main').css('opacity', '0.5');
        $prompt.prop('disabled', true);
        $btn.prop('disabled', true).text('Генерация...');
        
        
        setTimeout(checkQueueStatus, currentWaitingTime);
        
    } else {
      // Нет активной генерации
      // Останавливаем опрос, если он шел
      // window.isPollingForResult = false;
        
        
        
        
        
        if (!userwaiting || (userwaitingparams && userwaitingparams !== "0" && JSON.parse(userwaitingparams).output_image)) {
             // window.isPollingForResult = false; // Останавливаем опрос

            // Останавливаем прогресс-бар
            if (progressIntervalId) {
                clearInterval(progressIntervalId);
                progressIntervalId = null;
            }
            $('#progress-container').fadeOut(300);
            $('#main').css('pointer-events', 'all');
            $('#main').css('opacity', '1');
            $('#prompt').prop('disabled', false);
            $('#btn-generate').prop('disabled', false).text('Создать изображение');

            // Если есть результат в userwaitingparams, показываем его
            if (userwaitingparams && userwaitingparams !== "0") {
                const params = JSON.parse(userwaitingparams);
                if (params.output_image) {
                    $('#output-container').html(`
                      <img src="${params.output_image}" alt="Result" />
                      <button class="download-btn download-btn-res" data-img-src="${params.output_image}" title="Скачать">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g fill="currentColor"><path d="M9 7.826V1H7v6.826L4.392 5.59L3.09 7.108L8 11.318l4.91-4.21l-1.302-1.518z"/><path d="M3 13v-3H1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3h-2v3z"/></g></svg>
                      </button>
                    `);
                    if (!$('#output-container').hasClass('image-container-hover')) $('#output-container').addClass('image-container-hover');
                    $('#btn-use-result').show();
                    return;
                }
            }

            // Если результата в userwaitingparams не было, обновляем историю
            // Это "запасной" вариант, на случай, если output_image появился в gotovo
            await getMyPict(true); // forceRender для обновления интерфейса

            // Ищем последнее изображение с output_image (новое)
            // Предполагаем, что getMyPict отсортировал по id DESC
            const latestFinished = allImages.find(img => img.output_image);
            if (latestFinished) {
                if ($("#input-container").find("img").length > 0) {
                    $('#output-container').html(`
                      <img src="${latestFinished.output_image}" alt="Result" />
                      <button class="download-btn download-btn-res" data-img-src="${latestFinished.output_image}" title="Скачать">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g fill="currentColor"><path d="M9 7.826V1H7v6.826L4.392 5.59L3.09 7.108L8 11.318l4.91-4.21l-1.302-1.518z"/><path d="M3 13v-3H1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3h-2v3z"/></g></svg>
                      </button>
                    `);
                    if (!$('#output-container').hasClass('image-container-hover')) $('#output-container').addClass('image-container-hover');
                    $('#btn-use-result').show();
                    readyimgUrl = latestFinished.output_image;
                    
                    if (latestFinished.params) {
                        const taskParams = JSON.parse(latestFinished.params);
                        $('#prompt').val(taskParams.prompt);
                    }
                }
                
            }

        } else {
            // Генерация еще не завершена, продолжаем опрос
            // if (window.isPollingForResult) {
            //     setTimeout(pollForResult, 3000); // Повторить через 3 сек
            // }
            setTimeout(checkQueueStatus, currentWaitingTime);
        }
        
        
        
        
        
      if (progressIntervalId) {
        clearInterval(progressIntervalId);
        progressIntervalId = null;
      }
      
      $progressContainer.hide();
      $progressBar.width('0%');
      
        $('#main').css('pointer-events', 'all');
        $('#main').css('opacity', '1');
        $btn.prop('disabled', false).text('Создать изображение');
        $prompt.prop('disabled', false);
      
        
    }

    // Обновляем отображение общей очереди (только до пользователя)
    updateWaitingCount(waitingcount);

  } catch (err) {
    console.error('Не удалось проверить очередь:', err);
    // Повторить попытку позже
    setTimeout(checkQueueStatus, 5000);
  }
}



// === ОБНОВЛЕНИЕ СЧЕТЧИКА ОЧЕРЕДИ ===
function updateWaitingCount(count) {
    
    
  const $queueInfo = $('#queue-info');
    var addtext = `<br>Примерно ${oneimagedurationforqueue} минут.`;
    addtext = ``;
  if (count > 0) {
    if ($queueInfo.length) {
      $queueInfo.html(`Генерация в очереди: <strong>${count}</strong>` + addtext);
        $('#queue-preloader').show();
    } else {
      $('<div id="queue-info" style="margin-top: 10px; font-size: 1.1rem; color: #f08761; text-align: center;">' +
        `Генерация в очереди: <strong>${count}</strong>` + addtext +
        '</div>').insertAfter('#progress-container');
        $('#queue-preloader').show();
    }
      const $progressContainer = $('#progress-container');
    const $progressBar = $('#progress-bar');
    $progressContainer.hide();
      $progressBar.width('0%');
  } else {
    $('#queue-info').remove();
      $('#queue-preloader').hide();
      
      
      
  }
}


function toggle_feedback_visibility() {
    var e = document.getElementById('feedback-main');
    if (e.style.display == 'block') {
        e.style.display = 'none';
        //document.body.style.removeProperty('pointer-events');
    } else {
        e.style.display = 'block';
        //document.body.style.setProperty('pointer-events', 'none');
    }
}
function toggle_message_visibility() {
    var e = document.getElementById('message-main');
    if (e.style.display == 'block') {
        e.style.display = 'none';
    } else {
        e.style.display = 'block';
    }
}

function replaceTransparencyWithGray(ctx) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
      // If pixel is fully transparent
      if (data[i + 3] < 254) {
          data[i] = 128;      // Red
          data[i + 1] = 128;  // Green
          data[i + 2] = 128;  // Blue
          data[i + 3] = 255;  // Opacity
      }
  }

  ctx.putImageData(imageData, 0, 0);
}


$(document).on('click', '#gallery-container img', function () {
  const src = $(this).attr('src');
  const modal = `
    <div class="big-preview-cont"
      onclick="this.remove()">
      <div class="position-relative">
        <img src="${src}" onclick="event.stopPropagation();">

        <button class="download-btn download-btn-big-preview" data-img-src="${src}" title="Скачать">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16"><g fill="currentColor"><path d="M9 7.826V1H7v6.826L4.392 5.59L3.09 7.108L8 11.318l4.91-4.21l-1.302-1.518z"/><path d="M3 13v-3H1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3h-2v3z"/></g></svg>
        </button>

        <button class="close-btn" onclick="this.remove()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 304 384"><path fill="currentColor" d="M299 73L179 192l120 119l-30 30l-120-119L30 341L0 311l119-119L0 73l30-30l119 119L269 43z"/></svg>
        </button>
      </div>
    </div>`;
  $(modal).appendTo('body');
});


$(document).on('click', '#output-container img', function () {
  const src = $(this).attr('src');
  const modal = `
    <div class="big-preview-cont"
      onclick="this.remove()">
      <div class="position-relative">
        <img src="${src}" onclick="event.stopPropagation();">

        <button class="download-btn download-btn-big-preview" data-img-src="${src}" title="Скачать">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16"><g fill="currentColor"><path d="M9 7.826V1H7v6.826L4.392 5.59L3.09 7.108L8 11.318l4.91-4.21l-1.302-1.518z"/><path d="M3 13v-3H1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3h-2v3z"/></g></svg>
        </button>

        
      </div>
    </div>`;
  $(modal).appendTo('body');
});

// Функция переключения режима отображения
function toggleViewMode() {
  const container = $('#gallery-container');
  
  if (currentViewMode === 'grid') {
      // Переключаем в режим сетки
      container.addClass('grid-view');
      container.removeClass('list-view');
      
      // Добавляем классы для элементов истории
      $('.history-item').addClass('grid-item').removeClass('list-item');
      $('.image-wrapper-sourcepict').removeClass('col-12 col-md-5');
      $('.image-wrapper').removeClass('col-12 col-md-5');
  } else {
      // Переключаем в режим списка
      container.removeClass('grid-view');
      container.addClass('list-view');
      
      // Добавляем классы для элементов истории
      $('.history-item').addClass('list-item').removeClass('grid-item');
      $('.image-wrapper-sourcepict').addClass('col-12 col-md-5');
      $('.image-wrapper').addClass('col-12 col-md-5');
  }
}

// === Функция скачивания изображения ===
function downloadImage(imgSrc) {
    // Создаем временный элемент <a> для скачивания
    const link = document.createElement('a');
    link.href = imgSrc;
    link.download = imgSrc.split('/').pop(); // Используем имя файла из URL
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}









// === Добавление всплывающих размеров изображений ===
function initImageSizeTooltips() {
  // Функция для получения размеров изображения и установки data-атрибутов
  function processImages(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Находим все изображения внутри контейнера
    const images = container.querySelectorAll('img');
    
    images.forEach(img => {
      // Если у изображения уже есть размеры, пропускаем
      if (img.dataset.imgw && img.dataset.imgh) {
        return;
      }
      
      // Проверяем, загружено ли изображение
      if (img.complete && img.naturalWidth !== 0) {
        // Изображение уже загружено
        img.dataset.imgw = img.naturalWidth;
        img.dataset.imgh = img.naturalHeight;
        setupTooltip(img);
      } else {
        // Дожидаемся загрузки изображения
        img.onload = function() {
          img.dataset.imgw = this.naturalWidth;
          img.dataset.imgh = this.naturalHeight;
          setupTooltip(this);
        };
        
        img.onerror = function() {
          console.warn('Не удалось загрузить изображение для получения размеров:', img.src);
        };
      }
    });
  }
  
  // Функция для настройки всплывающей подсказки
  function setupTooltip(img) {
    // Создаем элемент всплывающей подсказки
    const tooltip = document.createElement('div');
    tooltip.className = 'image-size-tooltip';
    tooltip.textContent = `${img.dataset.imgw}×${img.dataset.imgh}px`;
    
    // Добавляем подсказку как дочерний элемент изображения
    img.parentNode.appendChild(tooltip);
    
    // Обработчики событий для показа/скрытия
    // img.parentNode.addEventListener('mouseover', function() {
    //   tooltip.classList.add('show');
    // });
    
    // img.parentNode.addEventListener('mouseout', function() {
    //   tooltip.classList.remove('show');
    // });
  }
  
  // Обрабатываем изображения в указанных контейнерах
  processImages('output-container');
  processImages('gallery-container');
  
  // Также обрабатываем изображения, которые могут быть добавлены позже
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Элемент
          if (node.id === 'output-container' || node.id === 'gallery-container') {
            processImages(node.id);
          } else if (node.tagName === 'IMG') {
            // Проверяем, если это изображение в нужном контейнере
            if (node.parentElement && 
                (node.parentElement.id === 'output-container' || 
                 node.parentElement.id === 'gallery-container')) {
              if (!node.dataset.imgw) {
                // Если у изображения еще нет размеров, обрабатываем его
                if (node.complete && node.naturalWidth !== 0) {
                  node.dataset.imgw = node.naturalWidth;
                  node.dataset.imgh = node.naturalHeight;
                  setupTooltip(node);
                } else {
                  node.onload = function() {
                    this.dataset.imgw = this.naturalWidth;
                    this.dataset.imgh = this.naturalHeight;
                    setupTooltip(this);
                  };
                }
              }
            }
          } else {
            // Проверяем дочерние элементы
            const images = node.querySelectorAll('img');
            images.forEach(img => {
              if (!img.dataset.imgw) {
                if (img.complete && img.naturalWidth !== 0) {
                  img.dataset.imgw = img.naturalWidth;
                  img.dataset.imgh = img.naturalHeight;
                  setupTooltip(img);
                } else {
                  img.onload = function() {
                    this.dataset.imgw = this.naturalWidth;
                    this.dataset.imgh = this.naturalHeight;
                    setupTooltip(this);
                  };
                }
              }
            });
          }
        }
      });
    });
  });
  
  // Наблюдаем за изменениями в DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}





// === Инициализация при загрузке страницы ===
$(document).ready(async function () {
    
    $('#prompt').val('');
    
    // Инициализация режима отображения
    currentViewMode = 'list'; // 'list' или 'grid'
    
    
    const currentHostname = window.location.hostname;
    const cornerCreditContainer = $('#corner-credit');
    let logoHtml = '';
    
    if (currentHostname.includes('mag.300print.ru')) {
        logoHtml = `<img src="logo-ananas_var2.svg" alt="Ананаспринт" id="corner-logo" onclick="window.location.href = 'https://ananasprint.ru';">`;
        $('#popup').css('color', '#a1adbd');
        generator_url = 'http://mag.300print.ru:9090/sd/';
        $('#gotoGenerator').css('color', '#a1adbd');
    } else {
        logoHtml = `<img src="logo-koridor_var2.svg" alt="Зеленый Коридор" id="corner-logo" onclick="window.location.href = 'http://zkoridor.ru'">`;
        generator_url = 'http://zkoridor.ru:9090/sd/';
    }
    cornerCreditContainer.html(logoHtml);
    
    
  await getUserId();

  if (!userId) {
    alert('Не удалось получить ID пользователя. Попробуйте перезагрузить страницу.');
    return;
  }

    // Загружаем примеры один раз при старте
    await loadExamples();
    
    // Загружаем историю
    await getMyPict();

    outputcontainerContent = $('#output-container').html()+"";
    
    // --- НОВОЕ: Проверяем очередь при загрузке ---
    await checkQueueStatus();
    
    
    
    
  // Обработчики событий
  $('#image-upload').on('change', handleImageUpload);
  $('#input-container').on('click', function () {
    $('#image-upload').click();
  });
  $('#btn-generate').on('click', generateImage);
  // $('#output-container').on('click', function () {
    
  // });
   
    
    

    
    
    // === УНИВЕРСАЛЬНЫЕ ОБРАБОТЧИКИ ПАГИНАЦИИ (работают для всех .prev-page и .next-page) ===
    $(document).on('click', '.prev-page', function () {
      if (currentPage > 1) {
        currentPage--;
        renderHistory();
        toggleViewMode();
      }
    });

    $(document).on('click', '.next-page', function () {
      const totalPages = Math.max(1, Math.ceil(allImages.length / IMAGES_PER_PAGE));
      if (currentPage < totalPages) {
        currentPage++;
        renderHistory();
        toggleViewMode();
      }
    });
    
    
    // === Вкладки: Мои / Примеры ===
    $('#tab-my').on('click', function () {
      if ($(this).hasClass('active')) return;

      currentTab = 'my';
      $(this).addClass('active');
      $('#tab-examples').removeClass('active');
        
        $('.pagination-wrapper').show();

      // Скрываем пагинацию при переключении? Нет — она уже в DOM
      renderHistory();
      toggleViewMode();
    });

    $('#tab-examples').on('click', function () {
      if ($(this).hasClass('active')) return;

      currentTab = 'examples';
      $(this).addClass('active');
      $('#tab-my').removeClass('active');
        
        $('.pagination-wrapper').hide();

      renderExamples(); // Просто отображаем — данные уже есть
      currentViewMode = 'list'; 
      toggleViewMode();
    });
    
    
    // === Режимы отображения ===
    
    // Обработчики кнопок режима отображения
    $('#list-view-btn, #list-view-btn2').on('click', function() {
        if (currentViewMode === 'grid') {
            currentViewMode = 'list';
            toggleViewMode();
        }
    });
    
    $('#grid-view-btn, #grid-view-btn2').on('click', function() {
        if (currentViewMode === 'list') {
            currentViewMode = 'grid';
            toggleViewMode();
        }
    });
    
    

    // === Определяем, какую вкладку показывать по умолчанию ===
    if (allImages.length > 0) {
        $('#tab-my').show();
        $('#tab-examples').show();
        $('.pagination-wrapper').show();
        hideLoadingIfReady();
        renderHistory(); // Оставляем вкладку "Мои" активной по умолчанию
    } else {
        currentTab = 'examples';
        $('#tab-my').removeClass('active');
        $('#tab-examples').addClass('active');
        $('#tab-examples').show();
        hideLoadingIfReady();
      renderExamples(); // Показываем примеры
      
      // Устанавливаем минимальную высоту для блоков при первом запуске нового пользователя
      //$('#container').addClass('min-height');
      $('#left .image-container').addClass('min-height');
      $('#right .image-container').addClass('min-height');
    }

    
    
    
    $('#btn-use-result').off('click').on('click', function () {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Важно для кросс-доменных изображений, если есть CORS

        img.onload = function () {
            // Создаём canvas и рисуем изображение
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Replace transparency with gray
            replaceTransparencyWithGray(ctx);

            try {
                // Конвертируем в base64
                const dataURL = canvas.toDataURL('image/jpeg', 0.95); // JPEG с качеством 95%

                // Сохраняем в inputImageBase64
                inputImageBase64 = dataURL;

                // Отображаем в левом окне
                $('#input-container').html(`<img src="${dataURL}" alt="Input" />`);

                // Очищаем правое окно
                $('#output-container').html(outputcontainerContent);
                if ($('#output-container').hasClass('image-container-hover')) $('#output-container').removeClass('image-container-hover');
                $('#btn-use-result').hide(); // Скрываем кнопку


            } catch (err) {
                console.error('Ошибка при конвертации изображения в base64:', err);
                alert('Не удалось конвертировать изображение. Возможно, проблема с доступом (CORS).');
            }
        };

        img.onerror = function () {
            alert('Не удалось загрузить изображение для конвертации.');
        };

        // Загружаем изображение по пути
        img.src = readyimgUrl;
    });
    
    
    
    // === Обработчик клика по кнопке "взять как исходник" в галерее ===
    $(document).on('click', '.take-as-source-btn', function() {
        const as = $(this);
        console.log(as);
        const imgSrc = $(this).data('img-src'); // Получаем путь из data-атрибута
        currentpromptSrc = decodeURIComponent($(this).data('prompt')); // Получаем prompt из data-атрибута
        if (!imgSrc) {
            console.error('Не удалось получить путь к изображению');
            alert('Ошибка: не найден путь к изображению.');
            return;
        }

        // Создаем временный объект Image для загрузки и конвертации
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Важно, если изображения с другого домена

        img.onload = function() {
            // Создаем canvas для конвертации
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // Рисуем изображение на canvas
            ctx.drawImage(img, 0, 0);

            // Replace transparency with gray
            replaceTransparencyWithGray(ctx);

            try {
                // Конвертируем canvas в base64 (JPEG с качеством 95%)
                // Это соответствует логике handleImageUpload
                const mimeType = (imgSrc.toLowerCase().endsWith('.png') || imgSrc.includes('.png?')) ? 'image/png' : 'image/jpeg';
                const quality = (mimeType === 'image/jpeg') ? 0.95 : undefined;
                
                const dataURL = canvas.toDataURL(mimeType, quality);

                // Обновляем глобальную переменную
                inputImageBase64 = dataURL;

                // Отображаем изображение в левом окне
                $('#input-container').html(`<img src="${dataURL}" alt="Input" />`);

                // Прокручиваем страницу вверх к левому окну (опционально, но удобно)
                $('html, body').animate({
                    scrollTop: $("#left").offset().top - 20 // немного выше
                }, 500);

                $('#prompt').val(currentpromptSrc);
                
                console.log('Изображение установлено как исходное:', imgSrc);
            } catch (conversionError) {
                console.error('Ошибка при конвертации изображения в base64:', conversionError);
                alert('Не удалось обработать изображение. Ошибка конвертации.');
            }
        };

        img.onerror = function() {
            console.error('Не удалось загрузить изображение для установки как исходное:', imgSrc);
            alert('Не удалось загрузить изображение. Возможно, проблема с доступом (CORS) или файл отсутствует.');
        };

        // Начинаем загрузку изображения
        img.src = imgSrc;
    });
    
    // === Обработчик клика по кнопке "взять как запрос" для элементов history-prompt ===
    $(document).on('click', '.take-as-prompt-btn', function() {
        currentpromptSrc = decodeURIComponent($(this).data('prompt')); // Получаем prompt из data-атрибута
        $('#prompt').val(currentpromptSrc);
    });
    
    
    // === Обработчик клика по кнопке скачивания ===
    $(document).on('click', '.download-btn', function(e) {
        e.stopPropagation(); // Предотвращаем всплытие события
        const imgSrc = $(this).data('img-src');
        if (imgSrc) {
            downloadImage(imgSrc);
        }
    });

    // === Обработчик клика по кнопке удаления ===
    $(document).on('click', '.delete-btn', async function() {
        const imageId = $(this).data('image-id');
        if (!imageId) {
            console.error('Не удалось получить ID изображения для удаления');
            alert('Ошибка: не удалось идентифицировать изображение');
            return;
        }

        // Показываем модальное окно подтверждения
        showDeleteModal(imageId);
    });

    

    // Функция показа модального окна подтверждения удаления
    function showDeleteModal(imageId) {
        const modal = $('#delete-modal');
        modal.css('display', 'block');
        
        // Сохраняем ID изображения для последующего удаления
        modal.data('image-id', imageId);
        
        // Закрытие модального окна при клике на крестик или вне окна
        $('.close, #delete-modal').on('click', function(e) {
            if (e.target === this) {
                closeModal('#delete-modal');
            }
        });
        
        // Закрытие модального окна по Escape
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal('#delete-modal');
            }
        });
    }

    // Функция показа модального окна успешного удаления
    function showSuccessModal() {
        const modal = $('#success-modal');
        modal.css('display', 'block');
        
        // Закрытие модального окна при клике на крестик или вне окна
        $('.close, #success-modal').on('click', function(e) {
            if (e.target === this) {
                closeModal('#success-modal');
            }
        });
        
        // Закрытие модального окна по Escape
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal('#success-modal');
            }
        });
        
        // Добавляем обработчик для кнопки OK
        $('#close-success').off('click').on('click', function() {
            closeModal('#success-modal');
        });
    }

    // Функция закрытия модального окна
    function closeModal(modalId) {
        const modal = $(modalId);
        modal.css('display', 'none');
        
        // Убираем обработчики событий для предотвращения утечек памяти
        modal.off('click');
    }

    // Обработчики кнопок модального окна
    $(document).on('click', '#cancel-delete', function() {
        closeModal('#delete-modal');
    });

    $(document).on('click', '#confirm-delete', function() {
        const imageId = $('#delete-modal').data('image-id');
        if (imageId) {
            deleteImage(imageId);
        }
        closeModal('#delete-modal');
    });

    // Обработчик удаления изображения
    async function deleteImage(imageId) {
        try {
            const response = await $.post(API_URL, JSON.stringify({
                method: 'removeImage',
                user_id: userId,
                image_id: imageId
            }), 'json');

            if (response.error) {
                alert('Ошибка удаления: ' + response.error);
                return;
            }

            if (response.removed) {
                // Удаляем элемент из DOM
                $('.delete-btn[data-image-id="' + imageId + '"]').closest('.history-item').remove();
                
                // Обновляем список изображений
                allImages = allImages.filter(item => item.id != imageId);
                
                // Перерисовываем историю
                renderHistory();
                toggleViewMode();
                
                // Показываем модальное окно успешного удаления
                // showSuccessModal();
            }
        } catch (err) {
            console.error('Ошибка при удалении изображения:', err);
            alert('Ошибка соединения с сервером при удалении изображения');
        }
    }

    // Закрытие модальных окон при клике вне их области
    $(document).on('click', function(e) {
        if ($(e.target).is('#delete-modal')) {
            closeModal('#delete-modal');
        }
        if ($(e.target).is('#success-modal')) {
            closeModal('#success-modal');
        }
    });
    
    
    const animation = bodymovin.loadAnimation({
        container: document.getElementById("lottie"),
        path: "cute-cat-works.json",
        renderer: "svg",
        loop: true
    });
    
    
    document.querySelector("#feedback-form1").addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        let formData = Object.fromEntries(new FormData(form));
        //if (formData.comment.length < 15) {
        formData.user_id = userId;
        fetch("./api/feedback.php", {
            method: form.method,
            body: JSON.stringify(formData),
        }).then(async(result) => {
            let data = await result.json();
            console.log("feedback res data:", data);
            document.getElementById('feedback-main').style.display = 'none';
            formData.comment = "";
            alert("Спасибо, комментарий передан.");
        });
        //} else {
        //    alert("Мало");
        //}
    });



      createSamplesGallery();

      setTimeout(initImageSizeTooltips, 100);
});


