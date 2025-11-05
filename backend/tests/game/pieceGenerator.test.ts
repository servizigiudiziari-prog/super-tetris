import { PieceGenerator } from '../../src/game/pieceGenerator';
import { ALL_PIECES } from '../../src/game/constants';

describe('PieceGenerator', () => {
  describe('7-bag system', () => {
    it('should generate all 7 pieces within first 7 pieces', () => {
      const generator = new PieceGenerator(12345);
      const pieces = new Set<string>();

      for (let i = 0; i < 7; i++) {
        pieces.add(generator.getNextPiece());
      }

      expect(pieces.size).toBe(7);
      ALL_PIECES.forEach(piece => {
        expect(pieces.has(piece)).toBe(true);
      });
    });

    it('should generate same sequence with same seed', () => {
      const seed = 54321;
      const gen1 = new PieceGenerator(seed);
      const gen2 = new PieceGenerator(seed);

      const sequence1 = [];
      const sequence2 = [];

      for (let i = 0; i < 14; i++) {
        sequence1.push(gen1.getNextPiece());
        sequence2.push(gen2.getNextPiece());
      }

      expect(sequence1).toEqual(sequence2);
    });

    it('should generate different sequences with different seeds', () => {
      const gen1 = new PieceGenerator(111);
      const gen2 = new PieceGenerator(222);

      const sequence1 = [];
      const sequence2 = [];

      for (let i = 0; i < 14; i++) {
        sequence1.push(gen1.getNextPiece());
        sequence2.push(gen2.getNextPiece());
      }

      expect(sequence1).not.toEqual(sequence2);
    });

    it('should generate all pieces in each bag of 7', () => {
      const generator = new PieceGenerator(99999);

      // Generate 3 bags (21 pieces)
      for (let bag = 0; bag < 3; bag++) {
        const piecesInBag = new Set<string>();

        for (let i = 0; i < 7; i++) {
          piecesInBag.add(generator.getNextPiece());
        }

        // Each bag should have all 7 unique pieces
        expect(piecesInBag.size).toBe(7);
        ALL_PIECES.forEach(piece => {
          expect(piecesInBag.has(piece)).toBe(true);
        });
      }
    });
  });

  describe('peekNext', () => {
    it('should preview next pieces without consuming them', () => {
      const generator = new PieceGenerator(777);

      const preview = generator.peekNext(5);
      expect(preview.length).toBe(5);

      // Now get pieces and verify they match preview
      for (let i = 0; i < 5; i++) {
        const piece = generator.getNextPiece();
        expect(piece).toBe(preview[i]);
      }
    });

    it('should preview across bag boundary', () => {
      const generator = new PieceGenerator(888);

      // Consume 6 pieces from first bag
      for (let i = 0; i < 6; i++) {
        generator.getNextPiece();
      }

      // Preview next 5 (should include pieces from second bag)
      const preview = generator.peekNext(5);
      expect(preview.length).toBe(5);

      // Verify preview matches actual pieces
      for (let i = 0; i < 5; i++) {
        const piece = generator.getNextPiece();
        expect(piece).toBe(preview[i]);
      }
    });
  });

  describe('getPiecesGenerated', () => {
    it('should track number of pieces generated', () => {
      const generator = new PieceGenerator(555);

      expect(generator.getPiecesGenerated()).toBe(0);

      generator.getNextPiece();
      expect(generator.getPiecesGenerated()).toBe(1);

      for (let i = 0; i < 9; i++) {
        generator.getNextPiece();
      }
      expect(generator.getPiecesGenerated()).toBe(10);
    });
  });

  describe('getPieceForSeed (static)', () => {
    it('should get correct piece at index without maintaining state', () => {
      const seed = 11111;
      const generator = new PieceGenerator(seed);

      // Generate first 10 pieces
      const sequence = [];
      for (let i = 0; i < 10; i++) {
        sequence.push(generator.getNextPiece());
      }

      // Verify static method returns same pieces
      for (let i = 0; i < 10; i++) {
        const piece = PieceGenerator.getPieceForSeed(seed, i);
        expect(piece).toBe(sequence[i]);
      }
    });

    it('should work for large indices', () => {
      const seed = 42;
      const index = 100; // 14th bag, 2nd piece

      const piece = PieceGenerator.getPieceForSeed(seed, index);

      // Verify it's a valid piece
      expect(ALL_PIECES).toContain(piece);

      // Create generator and verify
      const generator = new PieceGenerator(seed);
      for (let i = 0; i <= index; i++) {
        const generated = generator.getNextPiece();
        if (i === index) {
          expect(generated).toBe(piece);
        }
      }
    });
  });

  describe('determinism', () => {
    it('should be fully deterministic for cooperative gameplay', () => {
      const seed = 2023;

      // Simulate 4 players all starting with same seed
      const player1 = new PieceGenerator(seed);
      const player2 = new PieceGenerator(seed);
      const player3 = new PieceGenerator(seed);
      const player4 = new PieceGenerator(seed);

      // All players should get identical sequences
      for (let i = 0; i < 20; i++) {
        const p1 = player1.getNextPiece();
        const p2 = player2.getNextPiece();
        const p3 = player3.getNextPiece();
        const p4 = player4.getNextPiece();

        expect(p1).toBe(p2);
        expect(p2).toBe(p3);
        expect(p3).toBe(p4);
      }
    });
  });
});
