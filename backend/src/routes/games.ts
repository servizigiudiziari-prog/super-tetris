import { Router, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { GameService } from '../services/gameService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { moveLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * Validation middleware helper
 */
const validate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: errors.array(),
      },
    });
  }
  next();
};

/**
 * POST /api/games/create
 * Create a new game with 4 players
 */
router.post(
  '/create',
  authenticate,
  [
    body('playerIds')
      .isArray({ min: 4, max: 4 })
      .withMessage('Exactly 4 players required'),
    body('playerIds.*').isUUID().withMessage('Invalid player ID format'),
    body('targetLines')
      .optional()
      .isInt({ min: 10, max: 500 })
      .withMessage('Target lines must be between 10 and 500'),
    body('maxDurationHours')
      .optional()
      .isInt({ min: 1, max: 168 })
      .withMessage('Max duration must be between 1 and 168 hours'),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { playerIds, targetLines, maxDurationHours } = req.body;

      const result = await GameService.createGame(
        req.user!.id,
        playerIds,
        targetLines,
        maxDurationHours
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/games/:gameId
 * Get game state with players and recent moves
 */
router.get(
  '/:gameId',
  authenticate,
  [param('gameId').isUUID().withMessage('Invalid game ID')],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;

      const result = await GameService.getGameState(gameId, req.user!.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/games/:gameId/moves
 * Submit a move (place a piece)
 */
router.post(
  '/:gameId/moves',
  authenticate,
  moveLimiter,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
    body('pieceType')
      .isIn(['I', 'O', 'T', 'S', 'Z', 'J', 'L'])
      .withMessage('Invalid piece type'),
    body('rotation')
      .isInt({ min: 0, max: 3 })
      .withMessage('Rotation must be 0-3'),
    body('position').isObject().withMessage('Position must be an object'),
    body('position.x')
      .isInt({ min: 0, max: 9 })
      .withMessage('Position x must be 0-9'),
    body('position.y')
      .isInt({ min: 0, max: 19 })
      .withMessage('Position y must be 0-19'),
    body('timeTaken')
      .isInt({ min: 0, max: 300 })
      .withMessage('Time taken must be 0-300 seconds'),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const moveRequest = req.body;

      const result = await GameService.submitMove(
        gameId,
        req.user!.id,
        moveRequest
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/games/:gameId/next-piece
 * Get the next piece for the current move count
 */
router.get(
  '/:gameId/next-piece',
  authenticate,
  [param('gameId').isUUID().withMessage('Invalid game ID')],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;

      const nextPiece = await GameService.getNextPiece(gameId);

      res.status(200).json({
        success: true,
        data: {
          pieceType: nextPiece,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/games/:gameId/preview
 * Preview next N pieces
 */
router.get(
  '/:gameId/preview',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
    query('count')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Count must be 1-10'),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const count = req.query.count ? parseInt(req.query.count as string) : 3;

      const preview = await GameService.previewPieces(gameId, count);

      res.status(200).json({
        success: true,
        data: {
          preview,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/games/my-active
 * Get user's active games
 */
router.get(
  '/my-active',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const games = await GameService.getUserActiveGames(req.user!.id);

      res.status(200).json({
        success: true,
        data: {
          games,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/games/:gameId/stats
 * Get game statistics
 */
router.get(
  '/:gameId/stats',
  authenticate,
  [param('gameId').isUUID().withMessage('Invalid game ID')],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;

      const stats = await GameService.getGameStats(gameId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/games/:gameId/validate-move
 * Validate if a move is possible (without executing it)
 */
router.post(
  '/:gameId/validate-move',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
    body('pieceType')
      .isIn(['I', 'O', 'T', 'S', 'Z', 'J', 'L'])
      .withMessage('Invalid piece type'),
    body('rotation')
      .isInt({ min: 0, max: 3 })
      .withMessage('Rotation must be 0-3'),
    body('position').isObject().withMessage('Position must be an object'),
    body('position.x')
      .isInt({ min: 0, max: 9 })
      .withMessage('Position x must be 0-9'),
    body('position.y')
      .isInt({ min: 0, max: 19 })
      .withMessage('Position y must be 0-19'),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const { pieceType, rotation, position } = req.body;

      const piece = {
        type: pieceType,
        rotation,
        position,
      };

      const result = await GameService.validateMove(gameId, piece);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/games/:gameId/ghost-position
 * Calculate ghost piece position (hard drop preview)
 */
router.post(
  '/:gameId/ghost-position',
  authenticate,
  [
    param('gameId').isUUID().withMessage('Invalid game ID'),
    body('pieceType')
      .isIn(['I', 'O', 'T', 'S', 'Z', 'J', 'L'])
      .withMessage('Invalid piece type'),
    body('rotation')
      .isInt({ min: 0, max: 3 })
      .withMessage('Rotation must be 0-3'),
    body('position').isObject().withMessage('Position must be an object'),
    body('position.x')
      .isInt({ min: 0, max: 9 })
      .withMessage('Position x must be 0-9'),
    body('position.y')
      .isInt({ min: 0, max: 19 })
      .withMessage('Position y must be 0-19'),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const { pieceType, rotation, position } = req.body;

      const piece = {
        type: pieceType,
        rotation,
        position,
      };

      const ghostPosition = await GameService.calculateGhostPosition(
        gameId,
        piece
      );

      res.status(200).json({
        success: true,
        data: {
          ghostPosition,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
