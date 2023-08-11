var loadCode = (async function () {
  const BASE_URL = "https://ziadamer111.pythonanywhere.com/"
  const addCVBtn = document.querySelector(".add-cv")
  const addNewCVLayout = document.querySelector(".add-new-cv-layout")
  const closeIcon = document.querySelector(".x-icon")
  const pdfFilesContainer = document.querySelector(".pdf-files-container")
  const addNewCVForm = document.querySelector(".add-new-cv-form")
  const addCVInput = document.getElementById("add-cv-input")
  const searchForm = document.querySelector(".search-form")
  const searchInput = document.getElementById("search-input")
  let CVs = null
  const pdfIcon = `
  <svg
    class="pdf-icon"
    height="25px"
    width="25px"
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    viewBox="0 0 309.267 309.267"
    xml:space="preserve"
  >
  <g>
    <path
      style="fill:#E2574C;"
      d="M38.658,0h164.23l87.049,86.711v203.227c0,10.679-8.659,19.329-19.329,19.329H38.658
      c-10.67,0-19.329-8.65-19.329-19.329V19.329C19.329,8.65,27.989,0,38.658,0z"
    />
    <path
      style="fill:#B53629;"
      d="M289.658,86.981h-67.372c-10.67,0-19.329-8.659-19.329-19.329V0.193L289.658,86.981z"
    />
    <path
      style="fill:#FFFFFF;"
      d="M217.434,146.544c3.238,0,4.823-2.822,4.823-5.557c0-2.832-1.653-5.567-4.823-5.567h-18.44
      c-3.605,0-5.615,2.986-5.615,6.282v45.317c0,4.04,2.3,6.282,5.412,6.282c3.093,0,5.403-2.242,5.403-6.282v-12.438h11.153
      c3.46,0,5.19-2.832,5.19-5.644c0-2.754-1.73-5.49-5.19-5.49h-11.153v-16.903C204.194,146.544,217.434,146.544,217.434,146.544z
      M155.107,135.42h-13.492c-3.663,0-6.263,2.513-6.263,6.243v45.395c0,4.629,3.74,6.079,6.417,6.079h14.159
      c16.758,0,27.824-11.027,27.824-28.047C183.743,147.095,173.325,135.42,155.107,135.42z M155.755,181.946h-8.225v-35.334h7.413
      c11.221,0,16.101,7.529,16.101,17.918C171.044,174.253,166.25,181.946,155.755,181.946z M106.33,135.42H92.964
      c-3.779,0-5.886,2.493-5.886,6.282v45.317c0,4.04,2.416,6.282,5.663,6.282s5.663-2.242,5.663-6.282v-13.231h8.379
      c10.341,0,18.875-7.326,18.875-19.107C125.659,143.152,117.425,135.42,106.33,135.42z M106.108,163.158h-7.703v-17.097h7.703
      c4.755,0,7.78,3.711,7.78,8.553C113.878,159.447,110.863,163.158,106.108,163.158z"
    />
  </g>
  </svg>
`

  function removeAllCVs() {
    pdfFilesContainer.querySelectorAll("div").forEach((e) => e.remove())
  }

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const inputValue = searchInput?.value?.trim()
    if (inputValue === "") insertDataIntoPdfFileContainer()
    const filteredArr = await search(inputValue)
    await insertDataIntoPdfFileContainer(filteredArr)
  })

  addNewCVForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const files = addCVInput.files

    if (files.length === 0) {
      alert("No files selected.")
      return
    }

    const fd = new FormData()

    for (let i = 0; i < files.length; i++) {
      fd.append("files", files[i])
    }
    // fd.append("files", addCVInput.files)
    // console.log()
    await addCVs(fd)
    addNewCVLayout.classList.remove("open")
  })

  closeIcon.addEventListener("click", () => {
    addNewCVLayout.classList.remove("open")
  })

  addNewCVLayout.addEventListener("click", (e) => {
    if (e.target === addNewCVLayout) {
      addNewCVLayout.classList.remove("open")
    }
  })

  addCVBtn.addEventListener("click", () => {
    addNewCVLayout.classList.add("open")
  })

  async function getAllCVs() {
    const response = await fetch(BASE_URL + "/pdfs")
    const data = await response.json()
    return data
  }

  async function addCVs(files) {
    const response = await fetch(BASE_URL + "/upload_pdf", {
      method: "POST",
      body: files,
    })
    const data = await response.text()
    return data
  }

  async function insertDataIntoPdfFileContainer(filteredArr) {
    const data = await getAllCVs()
    if (data) {
      let listOfPdfFiles = data.pdf_files

      if (filteredArr != null) {
        const newListOfPdfFiles = []

        filteredArr.forEach((e) => {
          const filePrefix = e.split(".")[0]
          listOfPdfFiles.forEach((filename) => {
            if (filename.includes(filePrefix)) {
              newListOfPdfFiles.push(filePrefix)
            }
          })
        })

        listOfPdfFiles = newListOfPdfFiles
      }

      removeAllCVs()
      listOfPdfFiles.forEach((e) => {
        const div = document.createElement("div")
        div.classList.add("cv")
        div.innerHTML = e.split(".")[0] + " " + pdfIcon
        pdfFilesContainer.append(div)
      })
      CVs = document.querySelectorAll(".cv")
      CVs?.forEach((cv) => {
        cv.addEventListener("click", async () => {
          console.log(cv.innerText + ".pdf")
          await previewCV(cv.innerText + ".pdf")
        })
      })
    }
  }

  async function previewCV(filename) {
    const response = await fetch(`${BASE_URL}/preview_cv?filename=${filename}`)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
  }

  async function search(keyword) {
    const response = await fetch(`${BASE_URL}/search?keyword=${keyword}`)
    const data = await response.json()
    return data
  }

  await insertDataIntoPdfFileContainer()
  CVs = document.querySelectorAll(".cv")

  CVs?.forEach((cv) => {
    cv.addEventListener("click", async () => {
      console.log(cv.innerText + ".pdf")
      await previewCV(cv.innerText + ".pdf")
    })
  })
})()
