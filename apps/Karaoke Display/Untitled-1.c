#include <stdio.h>
#include <stdlib.h>
struct node
{
    int data;
    struct node *next;
};
struct node *head = NULL, *tail = NULL, *nw, *temp, *temp1, *prev, *temp2;

void creation()
{
    int i, n, item;
    printf("Enter the no of nodes:");
    scanf("%d", &n);
    for (i = 0; i < n; i++)
    {
        printf("\nEnter the item:");
        scanf("%d", &item);
        nw = (struct node *)malloc(sizeof(struct node));
        nw->data = item;
        nw->next = NULL;

        if (head == NULL)
        {
            head = tail = nw;
        }
        else
        {
            tail->next = nw;
            tail = nw;
        }
    }
}

void deletion()
{
    if (head == NULL)
    {
        printf("linked list is empty\n");
    }
    else
    {
        temp = head;
        head = head->next;
        printf("Deleted item: %d\n", temp->data);
        free(temp);
    }
}

void insert_at_begin()
{
    int item;
    printf("\nEnter item:");
    printf("%d", &item);
    nw = (struct node *)malloc(sizeof(struct node));
    nw->data = item;
    nw->next = head;
    head = nw;
}
void insert_at_end()
{
    int item;
    printf("\nEnter item:");
    printf("%d", &item);
    nw = (struct node *)malloc(sizeof(struct node));
    nw->data = item;
    nw->next = NULL;
    tail->next = nw;
    tail = nw;
}
void insert_at_mid()
{
    int item, pos, i;
    printf("\nEnter item:");
    printf("%d", &item);
    printf("\nEnter position:");
    printf("%d", &pos);
    nw = (struct node *)malloc(sizeof(struct node));
    nw->data = item;
    temp1 = nw;
    for (i = 0; i < pos - 1; i++)
        temp1 = temp1->next;

    temp2 = temp1->next;

    nw->next = temp2;
    temp1->next = nw;
}
void del_begin()
{
    temp1 = head;
    head = head->next;
    temp1->next = NULL;
    free(temp1);
}

void del_end()
{
    int count = 0, i;
    temp1 = head;
    while (temp1 != NULL)
    {
        prev = temp1;
        temp1 = temp1->next;
    }
    temp1 = head;
    for (i = 0; i < count - 1; i++)
    {
        temp1 = temp1->next;
    }
    prev->next = NULL;
    tail = prev;
    free(temp1);
}
void del_at_mid()
{
    int pos, i;
    printf("Enter the position:");
    scanf("%d", &pos);

    temp1 = head;
    for (i = 0; i < pos - 1; i++)
    {
        temp1 = temp->next;
    }
    temp2 = temp1->next;
    temp1->next = temp2->next;

    free(temp2);
}
void display()
{
    if (head == NULL)
    {
        printf("linked list is empty\n");
    }
    else
    {
        temp = head;
        while (temp != NULL)
        {
            printf("%d ", temp->data);
            temp = temp->next;
        }
        printf("\n");
    }
}

int main()
{
    int c;

    do
    {
        printf("\n1.creation\n2.deletion\n3.display\n4..exit\n5.insetion");
        printf("\nEnter the choice:");
        scanf("%d", &c);
        switch (c)
        {
        case 1:
        {
            creation();
            break;
        }
        case 5:
        {
            int k;
            printf("\n1.insert begin\n2.insert mid\n3.insert end");
            sacnf("%d", &k);
            switch (k)
            {
            case 1:
            {
                insert_at_begin();
                break;
            }
            case 2:
            {
                insert_at_mid();
                break;
            }
            case 3:
            {
                insert_at_end();
                break;
            }
            default:
                break;
            }
            break;
        }
        case 2:
        {
            deletion();
            break;
        }
        case 3:
        {
            display();
            break;
        }
        default:
            printf("Invalid choice\n");
            break;
        }
    } while (c != 4);
    return 0;
}
