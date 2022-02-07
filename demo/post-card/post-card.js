const textElement = document.querySelector("p")
const originalText = textElement.textContent
const textLength = originalText.length
let displayedLength = 1
setInterval(() => {
    textElement.textContent = originalText.slice(0, displayedLength)
    displayedLength = ((displayedLength + 1) % (textLength + 1)) + 1
}, 500)