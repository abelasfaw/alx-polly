import { handleVote } from '../vote';
import { createClient } from '../../supabase/server';
import { revalidatePath } from 'next/cache';

// Mock the Supabase client and revalidatePath
jest.mock('../../supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
       select: jest.fn(() => {
        const mockReturn = {
          single: jest.fn(() => ({ data: null, error: { message: 'Mock error' } })),
          eq: jest.fn(function() {
            return mockReturn; // Allow chaining eq calls
          }),
        };
        return mockReturn;
      }),
      insert: jest.fn(() => ({ error: null })), // Simplified insert mock
      update: jest.fn(() => ({ error: null })), // Simplified update mock
    })),
    auth: {
      getUser: jest.fn(() => ({ data: { user: { id: 'test-user-id' } }, error: { message: 'Mock error' } })),
    },
    rpc: jest.fn(() => ({ error: null })), // Added rpc mock
  })),
}));


jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock FormData for Jest environment
global.FormData = class FormData {
  data: { [key: string]: string };

  constructor() {
    this.data = {};
  }

  append(name: string, value: string) {
    this.data[name] = value;
  }

  get(name: string) {
    return this.data[name];
  }
};

describe('handleVote', () => {
  const mockCreateClient = createClient as jest.Mock;


  const mockRevalidatePath = revalidatePath as jest.Mock;

  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });


  it('should return an error if pollId is missing', async () => {
    const formData = new FormData();
    formData.append('optionId', 'option-1');
    const result = await handleVote(null, formData);
    expect(result).toEqual({ message: 'Poll ID is missing.', errors: {} });
    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should return an error if optionId is missing', async () => {
    const formData = new FormData();
    formData.append('pollId', 'poll-1');
    const result = await handleVote(null, formData);
    expect(result).toEqual({ message: 'Option ID is missing.', errors: {} });
    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should return an error if poll not found', async () => {
    mockCreateClient.mockReturnValueOnce({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: { message: 'Mock error' } }))
          })),
        })),
      })),
      auth: {
        getUser: jest.fn(() => ({ data: { user: { id: 'test-user-id' } }, error: { message: 'Mock error' } }))
      }
    });

    const formData = new FormData();
    formData.append('pollId', 'poll-1');
    formData.append('optionId', 'option-1');
    const result = await handleVote(null, formData);
    expect(result).toEqual({ message: 'Mock error', errors: {} });
    expect(mockCreateClient).toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should return an error if user is not authenticated', async () => {
    mockCreateClient.mockReturnValueOnce({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: { id: 'poll-1' }, error: { message: 'Mock error' } }))
          })),
        })),
      })),
      auth: {
        getUser: jest.fn(() => ({ data: { user: null }, error: { message: 'Mock error' } }))
      }
    });
    const formData = new FormData();
    formData.append('pollId', 'poll-1');
    formData.append('optionId', 'option-1');
    const result = await handleVote(null, formData);
    expect(result).toEqual({ message: 'Mock error', errors: {} });
    expect(mockCreateClient).toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
