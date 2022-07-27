import { StringInsertion } from '@nrwl/devkit'
import { ResultStorage } from 'firebase-functions/v1/testLab'
import * as fs from 'fs'
import { isValidElement } from 'react'

export function sharedQuizserver(): string {
  return 'shared-quizserver'
}

interface ImageFileImportInfo {
  srcdir: string
  qid: string
  srcFileName: string
  destFileName: string
}

export const imageFileImporterA = (srcdir: string) => {
  const results: ImageFileImportInfo[] = []

  const dirs = fs.readdirSync(srcdir)
  for (const dir of dirs) {
    const subdirs = fs.readdirSync(`${srcdir}/${dir}`)

    for (const qid of subdirs) {
      const files = fs.readdirSync(`${srcdir}/${dir}/${qid}`)

      for (const srcFileName of files) {
        const isValidFileName =
          srcFileName.charAt(0) === 'a' || srcFileName.charAt(0) === 'c'

        // if (!isValidFileName) {
        //   console.log(`${qid}/${srcFileName}`)
        // }

        const ifii: ImageFileImportInfo = {
          srcdir: `${srcdir}/${dir}`,
          qid,
          srcFileName,
          destFileName: isValidFileName
            ? srcFileName.toLowerCase()
            : 'a001.jpg',
        }
        results.push(ifii)
      }
    }
  }
  return results
}

export const imageFileImporter = (srcdir: string, outdir: string) => {
  const datas = imageFileImporterA(srcdir)

  // TODO 必要ならここで画像加工

  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir)
  }

  for (const ifii of datas) {
    if (!fs.existsSync(`${outdir}/${ifii.qid}`)) {
      fs.mkdirSync(`${outdir}/${ifii.qid}`)
    }

    const buf = fs.readFileSync(
      `${ifii.srcdir}/${ifii.qid}/${ifii.srcFileName}`
    )
    fs.writeFileSync(`${outdir}/${ifii.qid}/${ifii.destFileName}`, buf)
  }
}
