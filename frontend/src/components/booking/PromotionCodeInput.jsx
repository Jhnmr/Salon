/**
 * SALON PWA - Promotion Code Input Component
 * Allows users to apply discount codes to their booking
 */

import { useState } from 'react';
import { Button, Input } from '../ui';
import * as promotionsService from '../../services/promotions.service';

/**
 * PromotionCodeInput Component
 * @param {Object} props
 * @param {number} props.serviceId - Service ID
 * @param {number} props.branchId - Branch ID
 * @param {number} props.originalAmount - Original amount before discount
 * @param {Function} props.onApply - Callback when promotion is applied (receives discount data)
 * @param {Function} props.onRemove - Callback when promotion is removed
 */
const PromotionCodeInput = ({
  serviceId,
  branchId,
  originalAmount,
  onApply,
  onRemove
}) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState(null);

  /**
   * Validate and apply promotion code
   */
  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a promotion code');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // Validate promotion code with backend
      const response = await promotionsService.validatePromotion({
        code: code.trim().toUpperCase(),
        service_id: serviceId,
        branch_id: branchId,
        amount: originalAmount,
      });

      if (response.valid) {
        const promotionData = {
          code: code.trim().toUpperCase(),
          type: response.type,
          discount: response.discount,
          discountedAmount: response.discounted_amount,
          savings: response.savings,
        };

        setAppliedPromotion(promotionData);

        if (onApply) {
          onApply(promotionData);
        }
      } else {
        setError(response.message || 'Invalid promotion code');
      }
    } catch (err) {
      setError(err.message || 'Failed to validate promotion code');
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Remove applied promotion
   */
  const handleRemove = () => {
    setAppliedPromotion(null);
    setCode('');
    setError('');

    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="space-y-4">
      {/* Promotion Code Input */}
      {!appliedPromotion ? (
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              disabled={isValidating}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApply();
                }
              }}
              className="uppercase"
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleApply}
            isLoading={isValidating}
            disabled={isValidating || !code.trim()}
          >
            Apply
          </Button>
        </div>
      ) : (
        /* Applied Promotion Display */
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="bg-green-500 rounded-full p-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-green-400 font-semibold text-sm">
                  Promotion Applied: {appliedPromotion.code}
                </p>
                <p className="text-green-300 text-sm mt-1">
                  {appliedPromotion.type === 'percentage' &&
                    `${appliedPromotion.discount}% off`
                  }
                  {appliedPromotion.type === 'fixed' &&
                    `$${(appliedPromotion.discount / 100).toFixed(2)} off`
                  }
                  {appliedPromotion.type === 'free_service' &&
                    'Free service'
                  }
                  {' - '}
                  You save ${(appliedPromotion.savings / 100).toFixed(2)}!
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-white transition-colors"
              title="Remove promotion"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Help Text */}
      {!appliedPromotion && !error && (
        <p className="text-xs text-gray-400">
          Have a promo code? Enter it above to get a discount on your booking.
        </p>
      )}
    </div>
  );
};

export default PromotionCodeInput;
