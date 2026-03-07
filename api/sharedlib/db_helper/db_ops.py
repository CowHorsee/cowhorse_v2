import pandas as pd
import os
from datetime import datetime

# Utility to get current timestamp in your specific format
def get_now():
    return datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")

class DBHelper:
    def __init__(self, data_dir="data/"):
        base_path = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join(base_path, "..", "dataset")

        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)

    def _get_path(self, table):
        return os.path.join(self.data_dir, f"{table}.csv")

    def extract(self, table, fields=None, conditions=None):
        """
        Extracts data from a CSV.
        :param fields: List of columns to return (e.g., ['name', 'email'])
        :param conditions: A dictionary for simple filtering (e.g., {'role_id': 1})
        """
        path = self._get_path(table)
        if not os.path.exists(path):
            print(f"File {path} does not exist. Returning empty DataFrame.")
            return pd.DataFrame()

        df = pd.read_csv(path)

        # Apply filtering (Where conditions)
        if conditions:
            for key, value in conditions.items():
                df = df[df[key] == value]

        # Select specific fields
        if fields:
            df = df[fields]

        return df

    def load(self, table, dataframe, mode='append'):
        """
        Loads data into CSV. 
        :param mode: 'append' to add rows, 'overwrite' to replace the whole file.
        """
        path = self._get_path(table)
        
        if mode == 'overwrite':
            dataframe.to_csv(path, index=False)
        else:
            # Append mode
            header = not os.path.exists(path)
            dataframe.to_csv(path, mode='a', index=False, header=header)

    def modify(self, table, update_values, conditions):
        """
        Extracts, updates specific rows based on conditions, and saves back.
        :param update_values: Dict of columns to update {'status_id': 4}
        """
        df = self.extract(table)
        if df.empty:
            return

        # Find rows matching conditions
        mask = pd.Series([True] * len(df))
        for key, value in conditions.items():
            mask &= (df[key] == value)

        # Apply updates
        for col, val in update_values.items():
            df.loc[mask, col] = val
            
        # Add a common audit field if it exists
        if 'last_modified_at' in df.columns:
            df.loc[mask, 'last_modified_at'] = get_now()

        self.load(table, df, mode='overwrite')

    def delete(self, table, conditions):
        """
        Removes rows that match the conditions.
        """
        df = self.extract(table)
        if df.empty:
            return

        # Filter out rows that meet conditions (keep everything else)
        for key, value in conditions.items():
            df = df[df[key] != value]

        self.load(table, df, mode='overwrite')

    def upsert(self, table, new_df, id_col):
        """
        Update existing records by ID, and insert new ones.
        """
        existing_df = self.extract(table)
        if existing_df.empty:
            self.load(table, new_df, mode='overwrite')
            return

        # Combine and drop duplicates keeping the last (the new data)
        updated_df = pd.concat([existing_df, new_df]).drop_duplicates(subset=[id_col], keep='last')
        self.load(table, updated_df, mode='overwrite')