import { Router, Request, Response } from 'express';
import { ResponseCode } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import { checkObjectId } from '../../shared/middle-ware';

const router = Router();
import File from '../../shared/file';

router.get('/:root/:id', checkObjectId, (req: Request, res: Response) => {
  File.download(res, req.params.root, req.params.id);
});

router.get('/:root/:id/:fileName', checkObjectId, (req: Request, res: Response) => {
  File.download(res, req.params.root, req.params.id, req.params.fileName);
});

export = router;
