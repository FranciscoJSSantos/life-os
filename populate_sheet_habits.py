import sqlite3
import csv
from datetime import datetime
import uuid

def migrate_to_sheet_habits():
    conn = sqlite3.connect('data/lifeos.db')
    c = conn.cursor()

    print("1. Limpando hábitos, rotinas, tarefas e logs antigos...")
    c.execute("DELETE FROM habit_logs")
    c.execute("DELETE FROM habit_schedules")
    c.execute("DELETE FROM habits")
    c.execute("DELETE FROM routine_items")
    c.execute("DELETE FROM routines")
    c.execute("DELETE FROM task_subtasks")
    c.execute("DELETE FROM tasks")

    # Criar ou obter categoria
    c.execute("SELECT id FROM categories WHERE name = 'Tratamento Médico'")
    row = c.fetchone()
    cat_id = None
    if row:
        cat_id = row[0]
    else:
        cat_id = str(uuid.uuid4())
        c.execute(
            "INSERT INTO categories (id, name, color, icon, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))",
            (cat_id, 'Tratamento Médico', '#06B6D4', 'sparkles')
        )

    print(f"Categoria pronta: {cat_id}")

    # 2. Criar os dois hábitos
    habit_manha_id = str(uuid.uuid4())
    habit_noite_id = str(uuid.uuid4())
    start_date = "2026-11-07"
    end_date = "2027-02-04"

    # Soro Manhã
    c.execute(
        """
        INSERT INTO habits (id, category_id, name, description, icon, color, habit_type, target_value, unit, status, start_date, end_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'BOOLEAN', 1.0, NULL, 'ACTIVE', ?, ?, datetime('now'), datetime('now'))
        """,
        (habit_manha_id, cat_id, 'Soro Manhã', 'Aplicação diária do soro médico prescrito pela manhã', 'sun', '#06B6D4', start_date, end_date)
    )
    c.execute(
        """
        INSERT INTO habit_schedules (id, habit_id, frequency_type, effective_from, effective_until, created_at, updated_at)
        VALUES (?, ?, 'DAILY', ?, ?, datetime('now'), datetime('now'))
        """,
        (str(uuid.uuid4()), habit_manha_id, start_date, end_date)
    )

    # Soro Noite
    c.execute(
        """
        INSERT INTO habits (id, category_id, name, description, icon, color, habit_type, target_value, unit, status, start_date, end_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'BOOLEAN', 1.0, NULL, 'ACTIVE', ?, ?, datetime('now'), datetime('now'))
        """,
        (habit_noite_id, cat_id, 'Soro Noite', 'Aplicação diária do soro médico prescrito à noite', 'moon', '#8B5CF6', start_date, end_date)
    )
    c.execute(
        """
        INSERT INTO habit_schedules (id, habit_id, frequency_type, effective_from, effective_until, created_at, updated_at)
        VALUES (?, ?, 'DAILY', ?, ?, datetime('now'), datetime('now'))
        """,
        (str(uuid.uuid4()), habit_noite_id, start_date, end_date)
    )

    print("Hábitos 'Soro Manhã' e 'Soro Noite' criados!")

    # 3. Ler CSV e importar histórico de logs
    logs_inserted = 0
    with open('temp_sheet.csv', mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or len(row) < 5:
                continue
            
            parsed_date = None
            row_date_idx = None
            for col_idx in [1, 0, 2]:
                if col_idx < len(row):
                    val = row[col_idx].strip()
                    try:
                        parsed_date = datetime.strptime(val, "%d/%m/%Y").date()
                        row_date_idx = col_idx
                        break
                    except ValueError:
                        pass
            
            if not parsed_date:
                continue

            try:
                soro_manha_val = row[row_date_idx + 2].strip().upper() == 'TRUE'
                soro_noite_val = row[row_date_idx + 3].strip().upper() == 'TRUE'
                sintomas = row[row_date_idx + 5].strip() if (row_date_idx + 5) < len(row) else ""
                obs = row[row_date_idx + 6].strip() if (row_date_idx + 6) < len(row) else ""
                
                notes_text = sintomas
                if obs:
                    notes_text = f"{sintomas} | {obs}" if notes_text else obs

                target_iso_date = parsed_date.isoformat()

                if soro_manha_val:
                    c.execute(
                        """
                        INSERT INTO habit_logs (id, habit_id, scheduled_date, value, status, notes, created_at, updated_at)
                        VALUES (?, ?, ?, 1.0, 'COMPLETED', ?, datetime('now'), datetime('now'))
                        """,
                        (str(uuid.uuid4()), habit_manha_id, target_iso_date, notes_text or None)
                    )
                    logs_inserted += 1

                if soro_noite_val:
                    c.execute(
                        """
                        INSERT INTO habit_logs (id, habit_id, scheduled_date, value, status, notes, created_at, updated_at)
                        VALUES (?, ?, ?, 1.0, 'COMPLETED', ?, datetime('now'), datetime('now'))
                        """,
                        (str(uuid.uuid4()), habit_noite_id, target_iso_date, notes_text or None)
                    )
                    logs_inserted += 1

                if soro_manha_val or soro_noite_val:
                    print(f"Log importado para {target_iso_date}: Manhã={soro_manha_val}, Noite={soro_noite_val}, Notas='{notes_text}'")

            except Exception as ex:
                print(f"Erro na linha {row}: {ex}")

    print(f"Total de logs de soro inseridos: {logs_inserted}")

    # 4. Criar Rotinas do Tratamento
    rotina_manha_id = str(uuid.uuid4())
    c.execute(
        """
        INSERT INTO routines (id, name, description, active, days_of_week, created_at, updated_at)
        VALUES (?, 'Rotina Matinal (Soros & Cuidados) ☀️', 'Tratamento matinal de soros e lavagem nasal', 1, '0,1,2,3,4,5,6', datetime('now'), datetime('now'))
        """,
        (rotina_manha_id,)
    )
    c.execute(
        """
        INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, linked_habit_id, created_at, updated_at)
        VALUES (?, ?, 'Aplicação Soro Manhã', '07:30', 5, 1, ?, datetime('now'), datetime('now'))
        """,
        (str(uuid.uuid4()), rotina_manha_id, habit_manha_id)
    )
    c.execute(
        """
        INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, created_at, updated_at)
        VALUES (?, ?, 'Lavagem Nasal com Soro Fisiológico', '07:45', 10, 2, datetime('now'), datetime('now'))
        """,
        (str(uuid.uuid4()), rotina_manha_id)
    )
    c.execute(
        """
        INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, created_at, updated_at)
        VALUES (?, ?, 'Registro de Sensações / Sintomas', '08:00', 5, 3, datetime('now'), datetime('now'))
        """,
        (str(uuid.uuid4()), rotina_manha_id)
    )

    rotina_noite_id = str(uuid.uuid4())
    c.execute(
        """
        INSERT INTO routines (id, name, description, active, days_of_week, created_at, updated_at)
        VALUES (?, 'Rotina Noturna (Soros & Repouso) 🌙', 'Tratamento noturno e registro diário de adesão', 1, '0,1,2,3,4,5,6', datetime('now'), datetime('now'))
        """,
        (rotina_noite_id,)
    )
    c.execute(
        """
        INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, linked_habit_id, created_at, updated_at)
        VALUES (?, ?, 'Aplicação Soro Noite', '21:30', 5, 1, ?, datetime('now'), datetime('now'))
        """,
        (str(uuid.uuid4()), rotina_noite_id, habit_noite_id)
    )
    c.execute(
        """
        INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, created_at, updated_at)
        VALUES (?, ?, 'Lavagem Nasal Noturna', '21:45', 10, 2, datetime('now'), datetime('now'))
        """,
        (str(uuid.uuid4()), rotina_noite_id)
    )
    c.execute(
        """
        INSERT INTO routine_items (id, routine_id, title, start_time, duration_minutes, position, created_at, updated_at)
        VALUES (?, ?, 'Anotação de Sintomas Diários e Adesão', '22:00', 5, 3, datetime('now'), datetime('now'))
        """,
        (str(uuid.uuid4()), rotina_noite_id)
    )

    # 5. Criar Tarefas de Apoio ao Tratamento
    task1_id = str(uuid.uuid4())
    c.execute(
        """
        INSERT INTO tasks (id, category_id, title, description, priority, status, due_date, created_at, updated_at)
        VALUES (?, ?, 'Comprar novo frasco de soro médico antes do dia 25', 'Garantir reposição do frasco prescrito para não interromper os 90 dias', 'HIGH', 'PENDING', '2026-11-25', datetime('now'), datetime('now'))
        """,
        (task1_id, cat_id)
    )

    task2_id = str(uuid.uuid4())
    c.execute(
        """
        INSERT INTO tasks (id, category_id, title, description, priority, status, due_date, created_at, updated_at)
        VALUES (?, ?, 'Consulta de retorno / reavaliação de 30 dias de soros', 'Apresentar histórico de adesão e sintomas dos primeiros 30 dias', 'URGENT', 'PENDING', '2026-12-07', datetime('now'), datetime('now'))
        """,
        (task2_id, cat_id)
    )

    conn.commit()
    conn.close()
    print("Migração para hábitos de soro concluída com 100% de sucesso!")

if __name__ == '__main__':
    migrate_to_sheet_habits()
