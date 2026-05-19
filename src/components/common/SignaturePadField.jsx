import { useRef } from "react"
import SignatureCanvas from "react-signature-canvas"

function SignaturePadField({ label, value, onChange }) {
  const signatureRef = useRef(null)

  const saveSignature = () => {
    if (!signatureRef.current) return

    if (signatureRef.current.isEmpty()) {
      onChange("")
      return
    }

    const dataUrl = signatureRef.current
      .getCanvas()
      .toDataURL("image/png")

    onChange(dataUrl)
  }

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
    }

    onChange("")
  }

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="mt-2 rounded-xl border border-gray-300 bg-white p-2">
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          canvasProps={{
            width: 320,
            height: 160,
            className: "w-full rounded-lg bg-white",
          }}
          onEnd={saveSignature}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Sign using finger, mouse, or stylus.
        </p>

        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"
        >
          Clear
        </button>
      </div>

      {value && (
        <p className="mt-2 text-xs font-semibold text-green-700">
          Signature captured
        </p>
      )}
    </div>
  )
}

export default SignaturePadField