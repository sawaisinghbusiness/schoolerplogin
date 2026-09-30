-- ==============================================================================
-- Atomic fee-payment helper
-- Bumps paid_fee on the student's fee_ledger row for a session, creating the
-- ledger row if it doesn't exist yet. balance_fee is a generated column, so it
-- recomputes automatically. Called by feeService.recordPayment().
-- ==============================================================================
CREATE OR REPLACE FUNCTION increment_paid_fee(
    p_student_id UUID,
    p_session VARCHAR,
    p_amount NUMERIC
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO fee_ledger (student_id, session, total_fee, paid_fee)
    VALUES (p_student_id, p_session, 0, p_amount)
    ON CONFLICT (student_id, session)
    DO UPDATE SET
        paid_fee = fee_ledger.paid_fee + EXCLUDED.paid_fee,
        updated_at = NOW();
END;
$$;
