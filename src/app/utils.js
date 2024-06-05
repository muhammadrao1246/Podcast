export function checkIfFilesAreCorrectType(files?: [File]): boolean {
    let valid = true
    if (files) {
      files.map(file => {
        if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
          valid = false
        }
      })
    }
    return valid
  }