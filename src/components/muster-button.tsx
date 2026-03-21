import { SAMPLE_ID } from '@/lib/sample-products'

interface MusterButtonProps {
  referencedId: string
  kategorie?: string
}

export function MusterButton({ referencedId, kategorie }: MusterButtonProps) {
  return (
    <form
      method="POST"
      action="https://www.hamburgpapier-shop.de/checkout/sample-line-item/add"
      target="_blank"
    >
      <input type="hidden" name="redirectTo" value="frontend.checkout.cart.page" />
      <input type="hidden" name={`lineItems[${referencedId}][id]`} value={referencedId} />
      <input type="hidden" name={`lineItems[${referencedId}][type]`} value="sample" />
      <input type="hidden" name={`lineItems[${referencedId}][referencedId]`} value={referencedId} />
      <input type="hidden" name={`lineItems[${referencedId}][sampleId]`} value={SAMPLE_ID} />
      <input type="hidden" name={`lineItems[${referencedId}][stackable]`} value="0" />
      <input type="hidden" name={`lineItems[${referencedId}][removable]`} value="1" />
      <input type="hidden" name={`lineItems[${referencedId}][quantity]`} value="1" />
      <input type="hidden" name={`lineItems[${referencedId}][orderSampleMaxAmount]`} value="1" />
      <input type="hidden" name={`lineItems[${referencedId}][orderSampleVariationAmount]`} value="10" />
      <input type="hidden" name={`lineItems[${referencedId}][orderMixedAllowed]`} value="isAllowed" />
      {kategorie && (
        <input
          type="hidden"
          name="utm"
          value={`utm_source=produktfinder&utm_medium=muster&utm_campaign=${kategorie}`}
        />
      )}
      <button
        type="submit"
        className="flex items-center justify-center gap-1 border-2 border-primary text-primary text-xs font-semibold px-3 py-2 rounded-lg min-h-[40px] w-full hover:bg-primary/5 transition-colors"
      >
        Kostenlos testen
      </button>
    </form>
  )
}
