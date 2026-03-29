export default function (aspectRatio: string) {
  const [w, h] = aspectRatio.split(':')
  return parseInt(w!) / parseInt(h!)
}
