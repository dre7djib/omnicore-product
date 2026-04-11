/**
 * Wraps an async route handler so any rejected promise is forwarded
 * to Express's error handler via next(err) automatically.
 *
 * Usage:
 *   router.get('/:id', asyncHandler(async (req, res) => {
 *     const item = await service.getById(req.params.id);
 *     res.json(item);
 *   }));
 *
 * Note: existing controllers already use try/catch + next(err).
 * This utility is provided for future routes that prefer the cleaner style.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
