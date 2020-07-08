import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface RequestDto{
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {

  public async execute({ title, value, type, category }: RequestDto): Promise<Transaction> {    
    const transactionsRepository = getCustomRepository(TransactionsRepository);    
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total){
      throw new AppError('Insuficient balance for this operation!');
    }
    
    //Verifica se categoria existe
    let findedCategory = await categoriesRepository.findOne({
      where: { title: category }
    });

    if (!findedCategory){
      findedCategory = await categoriesRepository.create({
        title: category
      });
      
      await categoriesRepository.save(findedCategory);
    }

    const transactionCreated = transactionsRepository.create({
      title, 
      value, 
      type, 
      category: findedCategory
    });

    await transactionsRepository.save(transactionCreated);
    
    return transactionCreated;


  }
}

export default CreateTransactionService;
